import { db } from '../../db/index.ts'
import { users } from '../../db/schema.ts'
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

  static async createUser(data: typeof users.$inferInsert) {
    return await db.insert(users).values(data)
  }
}
