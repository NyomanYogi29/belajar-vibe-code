import { redis } from '../../lib/redis.ts'

export class SessionRepository {
  private static readonly PREFIX = 'user'

  static async setSession(userId: string, sessionId: string, data: { refreshToken: string; ipAddress: string; userAgent: string }, ttlSeconds: number = 3600) {
    const key = `${this.PREFIX}:${userId}:${sessionId}`
    await redis.set(key, JSON.stringify(data), { ex: ttlSeconds })
  }

  static async getSession(userId: string, sessionId: string) {
    const key = `${this.PREFIX}:${userId}:${sessionId}`
    const data = await redis.get(key)
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null
  }

  static async deleteSession(userId: string, sessionId: string) {
    const key = `${this.PREFIX}:${userId}:${sessionId}`
    await redis.del(key)
  }
}
