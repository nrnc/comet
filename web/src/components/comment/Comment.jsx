import { IconDotsHorizontal, IconVote } from '@/components/ui/icons/Icons'
import { useState } from 'react'
import UserAvatar from '@/components/user/UserAvatar'
import Twemoji from 'react-twemoji'
import UserPopup from '@/components/user/UserPopup'
import { calendarDate } from '@/utils/timeUtils'
import ctl from '@netlify/classnames-template-literals'
import CommentEditor from '@/components/comment/CommentEditor'
import { useTranslation } from 'react-i18next'
import { useContextMenuTrigger } from '@/components/ui/context'
import { ContextMenuType } from '@/types/ContextMenuType'
import { useHasServerPermissions } from '@/hooks/useHasServerPermissions'
import { ServerPermission } from '@/types/ServerPermission'
import { useParams } from 'react-router-dom'
import { useStore } from '@/hooks/useStore'
import { useToggleCommentVote } from '@/components/comment/useToggleCommentVote'

const replyBtnClass = ctl(`
  ml-4
  text-xs
  text-gray-500
  hover:text-gray-700
  dark:hover:text-gray-300
  font-medium
  leading-none
  select-none
  cursor-pointer
`)

export default function Comment({
  comment,
  post,
  level = 0,
  setParentComment,
  isLast
}) {
  const { t } = useTranslation()
  const { serverId } = useParams()
  const [canComment, canVote] = useHasServerPermissions({
    serverId,
    permissions: [ServerPermission.CreateComment, ServerPermission.VoteComment]
  })
  const [collapse, setCollapse] = useState(false)
  const [replyingCommentId, setReplyingCommentId] = useStore(s => [
    s.replyingCommentId,
    s.setReplyingCommentId
  ])
  const isReplying = replyingCommentId === comment.id

  const contextMenuRef = useContextMenuTrigger({
    menuId: ContextMenuType.Comment,
    data: { comment }
  })

  return (
    <div
      className={`relative rounded dark:bg-gray-800 ${
        level === 0 ? '' : 'pl-4'
      }`}
    >
      <div id={comment.id} />

      <div ref={contextMenuRef} className="flex px-3 pt-3">
        <UserPopup user={comment.author}>
          <UserAvatar
            size={7}
            className="cursor-pointer transition hover:opacity-90"
            user={comment.author}
          />
        </UserPopup>

        <div
          className={`pl-3 pb-3 w-full ${
            (!!comment.childComments.length || isLast) && !collapse
              ? 'border-b dark:border-gray-750'
              : ''
          }`}
        >
          <div className="flex items-end pb-1.5">
            <UserPopup user={comment.author}>
              <div className="text-sm font-medium cursor-pointer hover:underline leading-none text-accent">
                {comment.author.name}
              </div>
            </UserPopup>
            <div className="text-11 text-mid font-medium pl-2 leading-none">
              {calendarDate(comment.createdAt)}
            </div>
          </div>

          <Twemoji options={{ className: 'twemoji' }}>
            <div
              className="prose prose-sm dark:prose-dark max-w-none"
              dangerouslySetInnerHTML={{ __html: comment.text }}
            />
          </Twemoji>

          <div className="flex items-center pt-2">
            <VoteButton comment={comment} canVote={canVote} />

            {canComment && (
              <div
                className={replyBtnClass}
                onClick={() => {
                  if (isReplying) {
                    setReplyingCommentId(null)
                  } else {
                    setReplyingCommentId(comment.id)
                  }
                }}
              >
                {isReplying ? t('comment.cancelReply') : t('comment.reply')}
              </div>
            )}

            {!!comment.childCount && (
              <div
                className={replyBtnClass}
                onClick={() => setCollapse(!collapse)}
              >
                {collapse
                  ? `${t('comment.showReplies')} (${comment.childCount})`
                  : t('comment.hideReplies')}
              </div>
            )}

            <div
              className={`ml-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center cursor-pointer`}
            >
              <IconDotsHorizontal className="w-5 h-5" />
            </div>
          </div>

          {isReplying && (
            <div className="pt-3 max-w-screen-md w-full">
              <CommentEditor
                postId={post.id}
                parentCommentId={comment.id}
                setOpen={() => setReplyingCommentId(null)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="pl-3">
        {!collapse &&
          comment.childComments.map((childComment, index) => (
            <Comment
              key={childComment.id}
              comment={childComment}
              level={level + 1}
              setParentComment={setParentComment}
              post={post}
              isLast={index < comment.childComments.length - 1}
            />
          ))}
      </div>
    </div>
  )
}

function VoteButton({ comment }) {
  const toggleVote = useToggleCommentVote(comment)

  return (
    <div
      onClick={e => {
        e.stopPropagation()
        toggleVote()
      }}
      className={`${
        comment.isVoted
          ? 'text-red-400'
          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
      } flex items-center cursor-pointer`}
    >
      <IconVote className="w-4 h-4" />
      <div className="ml-2 text-xs font-medium">{comment.voteCount}</div>
    </div>
  )
}
