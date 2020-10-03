import { Field, ObjectType } from 'type-graphql'
import { Usernames } from '@/types/Usernames'

@ObjectType()
export class UserProfile {
  @Field({ nullable: true })
  realName?: string

  @Field({ nullable: true })
  website?: string

  @Field({ nullable: true })
  bio?: string

  @Field({ nullable: true })
  avatar?: string

  @Field({ nullable: true })
  usernames?: Usernames
}