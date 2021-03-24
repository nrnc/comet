import { POST_FRAGMENT } from '@/graphql/fragments'
import { GET_MESSAGES, GET_POSTS } from '@/graphql/queries'
import { cacheExchange as ce } from '@urql/exchange-graphcache'

const removePostFromGetPosts = (postId, cache) => {
  cache
    .inspectFields('Query')
    .filter(field => field.fieldName === 'getPosts')
    .forEach(field => {
      cache.updateQuery(
        {
          query: GET_POSTS,
          variables: { ...field.arguments }
        },
        data => {
          data.getPosts.posts = data.getPosts.posts.filter(
            post => post.id !== postId
          )
          return data
        }
      )
    })
}

const removeMessageFromGetMessages = (messageId, cache) => {
  cache
    .inspectFields('Query')
    .filter(field => field.fieldName === 'getMessages')
    .forEach(field => {
      cache.updateQuery(
        {
          query: GET_MESSAGES,
          variables: { ...field.arguments }
        },
        data => {
          data.getMessages.messages = data.getMessages.messages.filter(
            message => message.id !== messageId
          )
          return data
        }
      )
    })
}

const pinPost = ({ postId: id }, cache) => {
  cache.writeFragment(POST_FRAGMENT, {
    id,
    isPinned: true
  })
}

const unpinPost = ({ postId: id }, cache) => {
  cache.writeFragment(POST_FRAGMENT, {
    id,
    isPinned: false
  })
}

const removePost = ({ postId: id, reason }, cache) => {
  cache.writeFragment(POST_FRAGMENT, {
    id,
    isPinned: false,
    isRemoved: true,
    text: `[removed${reason ? `: ${reason}` : ''}]`
  })
  removePostFromGetPosts(id, cache)
}

const deletePost = ({ postId: id }, cache) => {
  cache.writeFragment(POST_FRAGMENT, {
    id,
    isPinned: false,
    isDeleted: true,
    text: '[deleted]'
  })
  removePostFromGetPosts(id, cache)
}

export const cacheExchange = ce({
  keys: {
    GetPostsResponse: () => null,
    LinkMetadata: () => null,
    GetMessagesResponse: () => null,
    MessageSentResponse: () => null,
    MessageRemovedResponse: () => null
  },
  /*resolvers: {
    Query: {
      getMessages: simplePagination({
        offsetArgument: 'page',
        limitArgument: 'pageSize',
        mergeMode: 'before'
      }),
      getPosts: simplePagination({
        offsetArgument: 'page',
        limitArgument: 'pageSize',
        mergeMode: 'after'
      })
    }
  },*/
  optimistic: {
    pinPost,
    unpinPost,
    removePost,
    deletePost
  },
  updates: {
    Mutation: {
      pinPost: (data, variables, cache) => pinPost(variables, cache),
      unpinPost: (data, variables, cache) => unpinPost(variables, cache),
      removePost: (data, variables, cache) => removePost(variables, cache),
      deletePost: (data, variables, cache) => deletePost(variables, cache)
    },
    Subscription: {
      messageSent: (
        { messageSent: { userId, groupId, channelId, message } },
        _variables,
        cache
      ) => {
        let variables
        if (userId) variables = { userId }
        if (groupId) variables = { groupId }
        if (channelId) variables = { channelId }
        cache.updateQuery({ query: GET_MESSAGES, variables }, data => {
          if (data !== null) {
            data.getMessages.messages.push(message)
            return data
          } else {
            return null
          }
        })
      },
      messageUpdated: (
        { messageUpdated: { userId, groupId, channelId, message } },
        _variables,
        cache
      ) => {
        let variables = { page: 0, userId, groupId, channelId }
        cache.updateQuery({ query: GET_MESSAGES, variables }, data => {
          if (data !== null) {
            const i = data.getMessages.messages.findIndex(
              m => m.id === message.id
            )
            data.getMessages.messages[i] = message
            return data
          } else {
            return null
          }
        })
      },
      messageRemoved: (
        { messageRemoved: { userId, groupId, channelId, messageId } },
        _variables,
        cache
      ) => {
        let variables = { page: 0, userId, groupId, channelId }
        cache.updateQuery({ query: GET_MESSAGES, variables }, data => {
          if (data !== null) {
            data.getMessages.messages = data.getMessages.messages.filter(
              m => m.id !== messageId
            )
            return data
          } else {
            return null
          }
        })
      }
    }
  }
})