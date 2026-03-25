import { db } from '../db/index.ts'
import { users, sessions } from '../db/schema.ts'
import { and, eq, isNull } from 'drizzle-orm'

export class UserRepository {
  static async findActiveUserByEmail(email: string) {
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1)
    return result[0] || null
  }

  static async createUser(data: any) {
    return await db.insert(users).values(data)
  }

  static async createSession(userId: string, token: string) {
    return await db.insert(sessions).values({
      userId,
      token,
    })
  }
}
