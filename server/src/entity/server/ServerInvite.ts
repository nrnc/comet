import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Field, ID, ObjectType } from 'type-graphql'
import { customAlphabet } from 'nanoid'
import { InviteDuration, Server, User } from '@/entity'

const nanoid = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  8
)

@ObjectType()
@Entity()
export class ServerInvite {
  @Field(() => ID)
  @PrimaryKey()
  id: string = nanoid()

  @Field()
  @Property()
  createdAt: Date = new Date()

  @Field(() => InviteDuration)
  @Enum({
    items: () => InviteDuration
  })
  duration: InviteDuration = InviteDuration.Day

  @Field({ nullable: true })
  @Property({ nullable: true })
  maxUses?: number

  @Field()
  @Property()
  uses: number = 0

  @Field()
  @Property()
  isRevoked: boolean = false

  @Field()
  get isExpired(): boolean {
    if (this.maxUses && this.uses >= this.maxUses) return true
    if (this.duration === InviteDuration.Never) return false
    return new Date().getTime() > this.createdAt.getTime() + this.duration
  }

  @Field(() => Server)
  @ManyToOne(() => Server)
  server: Server

  @ManyToOne(() => User)
  creator: User
}