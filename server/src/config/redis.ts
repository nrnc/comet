import Redis from 'ioredis'
import { getUserId } from '@/util/auth'

export default {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: +process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || 'password',
  retryStrategy: times => Math.max(times * 100, 3000)
} as Redis.RedisOptions

export const onConnect = (connectionParams: { authorization: string }) => {
  if (connectionParams.authorization) {
    return {
      userId: getUserId(connectionParams.authorization)
    }
  } else {
    return { userId: null }
  }
}