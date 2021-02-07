import { ArgsType, Field, ID } from 'type-graphql'
import { CommentSort } from '@/comment/CommentSort'

@ArgsType()
export class CommentsArgs {
  @Field(() => ID, {
    nullable: true,
    description: 'Return all comments for given post ID'
  })
  postId: string

  @Field(() => CommentSort, {
    nullable: true,
    description: 'Sort comments by new or top',
    defaultValue: CommentSort.TOP
  })
  sort?: CommentSort
}
