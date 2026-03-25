import { db } from '../db/index.ts'
import { users } from '../db/schema.ts'
import { and, eq, isNull } from 'drizzle-orm'

export class UserService {
  static async registerUser(payload: any) {
    const { name, email, password } = payload

    // 1. Pengecekan apakah user aktif dengan email tersebut sudah ada
    const existingUser = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1)

    if (existingUser.length > 0) {
      throw new Error('User already exists')
    }

    // 2. Hash password menggunakan Bun built-in crypto
    const hashedPassword = await Bun.password.hash(password)

    // 3. Simpan user baru ke database
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: 'MURID', // default role
    })

    return 'OK'
  }
}
