import { EntityManager } from '@mikro-orm/postgresql'
import { Post, ServerUser } from '@/entity'
import DataLoader from 'dataloader'

export const postServerUserLoader = (em: EntityManager, userId: string) => {
  const loader = new DataLoader<string, ServerUser>(
    async (postIds: string[]) => {
      loader.clearAll()
      const posts = await em.find(Post, postIds, ['server'])
      const serverIds = posts.map(p => p.server.id)
      const serverUsers = await em.find(
        ServerUser,
        {
          server: serverIds,
          user: userId
        },
        ['user', 'role']
      )
      const map: Record<string, ServerUser> = {}
      postIds.forEach(postId => {
        const post = posts.find(p => p.id === postId)
        map[postId] = serverUsers.find(su => su.server === post.server)
      })
      return postIds.map(postId => map[postId])
    }
  )
  return loader
}