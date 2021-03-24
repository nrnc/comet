import {
  Arg,
  Args,
  Authorized,
  Ctx,
  ID,
  Mutation,
  Resolver,
  UseMiddleware
} from 'type-graphql'
import { Context, ServerPermission } from '@/types'
import { Comment, Notification, Post, CommentVote } from '@/entity'
import { CreateCommentArgs } from '@/resolver/comment'
import {
  CheckCommentAuthor,
  CheckCommentServerPermission,
  CheckPostServerPermission,
  handleText
} from '@/util'

@Resolver(() => Comment)
export class CommentMutations {
  @CheckPostServerPermission(ServerPermission.CreateComment)
  @Mutation(() => Comment, { description: 'Create a comment on a post' })
  async createComment(
    @Args() { text, postId, parentCommentId }: CreateCommentArgs,
    @Ctx() { user, em }: Context
  ) {
    text = text.replace(/<[^/>][^>]*><\/[^>]+>/, '')
    if (!text) throw new Error('Comment cannot be empty')

    const post = await em.findOneOrFail(Post, postId)

    text = handleText(text)

    const comment = em.create(Comment, {
      text: text,
      parentCommentId,
      post,
      author: user
    })
    post.commentCount++

    em.persist([comment, post])

    if (parentCommentId) {
      const parentComment = await em.findOneOrFail(Comment, parentCommentId, [
        'author'
      ])
      if (parentComment.author !== user) {
        em.persist(
          em.create(Notification, {
            comment,
            toUser: parentComment.author
          })
        )
      }
    } else {
      await em.populate(post, ['author'])
      if (post.author !== user) {
        em.persist(
          em.create(Notification, {
            comment,
            toUser: post.author
          })
        )
      }
    }

    await em.flush()

    await this.createCommentVote({ user, em }, comment.id)
    comment.isVoted = true
    comment.voteCount = 1

    return comment
  }

  @CheckCommentAuthor()
  @Mutation(() => Boolean, { description: 'Delete a comment' })
  async deleteComment(
    @Arg('commentId', () => ID) commentId: string,
    @Ctx() { user, em }: Context
  ) {
    const comment = await em.findOne(Comment, commentId, ['author', 'post'])
    if (comment.author !== user)
      throw new Error('Attempt to delete post by someone other than author')

    if (comment.isDeleted) throw new Error('Comment already deleted')

    comment.post.commentCount--
    comment.isDeleted = true
    comment.isPinned = false
    await em.persistAndFlush(comment)
    await em.nativeDelete(Notification, { comment })
    return true
  }

  @CheckCommentAuthor()
  @Mutation(() => Boolean, { description: 'Update a comment' })
  async updateComment(
    @Arg('commentId', () => ID) commentId: string,
    @Arg('text', { description: 'New comment text' }) text: string,
    @Ctx() { user, em }: Context
  ) {
    const comment = await em.findOne(Comment, commentId, ['author'])
    if (comment.author !== user)
      throw new Error('Attempt to edit post by someone other than author')
    text = handleText(text)
    comment.editedAt = new Date()
    comment.text = text
    await em.persistAndFlush(comment)
    return true
  }

  @CheckCommentServerPermission(ServerPermission.VoteComment)
  @Mutation(() => Boolean, { description: 'Add vote to a comment' })
  async createCommentVote(
    @Ctx() { user, em }: Context,
    @Arg('commentId', () => ID, { description: 'ID of comment to vote' })
    commentId: string
  ) {
    const comment = await em.findOneOrFail(Comment, commentId)
    let vote = await em.findOne(CommentVote, { user, comment })
    if (vote) throw new Error('You have already voted this comment')
    vote = em.create(CommentVote, { user, comment })
    comment.voteCount++
    await em.persistAndFlush([comment, vote])
    return true
  }

  @CheckCommentServerPermission(ServerPermission.VoteComment)
  @Mutation(() => Boolean, { description: 'Remove vote from a comment' })
  async removeCommentVote(
    @Ctx() { user, em }: Context,
    @Arg('commentId', () => ID, { description: 'ID of comment to remove vote' })
    commentId: string
  ) {
    const comment = await em.findOneOrFail(Comment, commentId)
    const vote = await em.findOneOrFail(CommentVote, { user, comment })
    comment.voteCount--
    await em.remove(vote).persistAndFlush([comment, vote])
    return true
  }

  @CheckCommentServerPermission(ServerPermission.ManageComments)
  @Mutation(() => Boolean, {
    description: 'Remove a comment (Requires ServerPermission.ManageComments)'
  })
  async removeComment(
    @Arg('commentId', () => ID, { description: 'ID of comment to remove' })
    commentId: string,
    @Arg('reason', { description: 'Reason for comment removal' })
    reason: string,
    @Ctx() { em, user }: Context
  ) {
    const comment = await em.findOneOrFail(Comment, commentId)

    em.assign(comment, {
      isRemoved: true,
      removedReason: reason,
      isPinned: false,
      pinPosition: null
    })

    await em.nativeDelete(Notification, { comment })
    comment.post.commentCount--
    await em.persistAndFlush(comment)
    return true
  }
}