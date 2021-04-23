import { EntityManager } from '@mikro-orm/postgresql'
import { Folder, UserFolder } from '@/entity'
import DataLoader from 'dataloader'

export const folderFollowingLoader = (
  em: EntityManager,
  currentUserId: string
) => {
  return new DataLoader<string, boolean>(async (folderIds: string[]) => {
    const userFolders = await em.find(UserFolder, {
      folder: folderIds,
      user: currentUserId
    })
    const map: Record<string, boolean> = {}
    folderIds.forEach(
      folderId =>
        (map[folderId] = !!userFolders.find(
          uf => uf.folder === em.getReference(Folder, folderId)
        ))
    )
    return folderIds.map(postId => map[postId])
  })
}