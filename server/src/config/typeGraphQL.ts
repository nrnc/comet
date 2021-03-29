import { authChecker } from '@/util/auth'
import { getPubSub } from '@/util/subscriptions'
import { BuildSchemaOptions } from 'type-graphql'
import path from 'path'
import * as resolvers from '@/resolver'

export const typeGraphQLConf = {
  resolvers: Object.values(resolvers) as unknown,
  emitSchemaFile:
    process.env.NODE_ENV === 'production'
      ? false
      : path.resolve(__dirname, '../../../schema.graphql'),
  validate: true,
  authChecker: authChecker,
  pubSub: getPubSub()
} as BuildSchemaOptions
