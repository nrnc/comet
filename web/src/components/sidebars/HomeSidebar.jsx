import React, { forwardRef } from 'react'
import Sidebar from '@/components/sidebars/base/Sidebar'
import SidebarSortButtons from '@/components/sidebars/base/SidebarSortButtons'
import { IconInbox, GraphicLogo, IconFriends, IconX } from '@/lib/Icons'
import { useHistory, useLocation } from 'react-router-dom'
import { useGroupsAndDms } from '@/components/providers/DataProvider'
import UserAvatar from '@/components/avatars/UserAvatar'
import { useMutation } from 'urql'
import { HIDE_DM, SEND_MESSAGE } from '@/graphql/mutations'
import SidebarLabelPlus from '@/components/sidebars/base/SidebarLabelPlus'
import SidebarLabel from '@/components/sidebars/base/SidebarLabel'
import SidebarItem from '@/components/sidebars/base/SidebarItem'
import { useTranslation } from 'react-i18next'
import { useDrop } from 'react-dnd'
import { DragItemTypes } from '@/lib/DragItemTypes'
import toast from 'react-hot-toast'
import { useContextMenuTrigger } from 'react-context-menu-wrapper'
import { ContextMenuType } from '@/components/context-menus/ContextMenuType'
import { mergeRefs } from '@/lib/mergeRefs'

export default forwardRef((props, ref) => {
  const groupsAndDms = useGroupsAndDms()

  const { t } = useTranslation()

  return (
    <Sidebar ref={ref}>
      <div className="h-12 border-b dark:border-gray-850 shadow flex items-center px-5 text-base font-medium">
        <GraphicLogo className="h-4" />
      </div>

      <div className="px-1.5 pt-3">
        <div className="space-y-0.5">
          <SidebarItem to="/friends">
            <IconFriends className="mr-3 h-5 w-5" />
            {t('friends.title')}
          </SidebarItem>

          <SidebarItem to="/inbox">
            <IconInbox className="mr-3 h-5 w-5" />
            {t('inbox.title')}
          </SidebarItem>
        </div>

        <SidebarLabel>Your Feed</SidebarLabel>

        <SidebarSortButtons />

        <SidebarLabelPlus plusLabel="Create DM">
          {t('dms.title')}
        </SidebarLabelPlus>

        <div className="space-y-0.5">
          {groupsAndDms.map(groupOrDm => {
            if (groupOrDm.__typename === 'Group') {
              const group = groupOrDm
              return <div>Group</div>
            } else if (groupOrDm.__typename === 'User') {
              const user = groupOrDm
              return <DirectMessage user={user} key={`user-${user.id}`} />
            }
          })}
        </div>
      </div>
    </Sidebar>
  )
})

function DirectMessage({ user }) {
  const { t } = useTranslation()

  const [_, hideDm] = useMutation(HIDE_DM)

  const { push } = useHistory()
  const { pathname } = useLocation()

  const contextMenuRef = useContextMenuTrigger({
    menuId: ContextMenuType.User,
    data: { user, showCloseDm: true }
  })

  const [_sendMessageRes, sendMessage] = useMutation(SEND_MESSAGE)

  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: DragItemTypes.POST,
    drop: (post, monitor) => {
      push(`/dm/${user.id}`)
      sendMessage({
        userId: user.id,
        text: `${location.origin}${post.relativeUrl}`
      })
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  })
  const isActive = isOver && canDrop

  return (
    <SidebarItem
      ref={mergeRefs(contextMenuRef, dropRef)}
      large
      to={`/dm/${user.id}`}
      key={`user-${user.id}`}
    >
      <UserAvatar
        size={9}
        showOnline
        user={user}
        dotClassName="ring-3 w-2.5 h-2.5 dark:ring-gray-800"
      />
      <span className="ml-3">{user.name}</span>

      <IconX
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
          hideDm({ userId: user.id })
          if (pathname === `/dm/${user.id}`) push('/friends')
        }}
        className="group-hover:block hidden w-5 h-5 ml-auto cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      />
    </SidebarItem>
  )
}