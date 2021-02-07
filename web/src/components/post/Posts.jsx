import { usePosts } from '@/lib/queries/usePosts'
import Post from '@/components/post/Post'
import AutoSizer from 'react-virtualized-auto-sizer'
import { Scrollbar } from 'react-scrollbars-custom'
import React from 'react'
import PageNavigator from '@/components/ui/PageNavigator'
import { Virtuoso } from 'react-virtuoso'

export default function Posts({
  variables,
  planet = false,
  embed = false,
  thumbnail = false,
  link = false,
  draggable = false,
  expandable = false
}) {
  const data = usePosts(variables)
  const posts = data ? data.posts : []

  return (
    <Virtuoso
      overscan={500}
      data={posts}
      itemContent={(index, post) => (
        <Post
          postData={post}
          {...{ planet, embed, thumbnail, link, draggable, expandable }}
        />
      )}
    />
  )
}
