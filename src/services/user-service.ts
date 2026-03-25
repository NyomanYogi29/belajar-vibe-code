import { db } from '../db/index.ts'
import { users, sessions } from '../db/schema.ts'
import { and, eq, isNull } from 'drizzle-orm'

export class UserService {
  static async registerUser(payload: any) {
    // ... no changes here ...
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

  static async loginUser(payload: any) {
    const { email, password } = payload

    // 1. Cari user yang aktif
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1)

    if (user.length === 0) {
      throw new Error('Email atau password salah')
    }

    // 2. Verifikasi password
    const isPasswordValid = await Bun.password.verify(password, user[0]!.password)

    if (!isPasswordValid) {
      throw new Error('Email atau password salah')
    }

    // 3. Generate token UUID
    const token = crypto.randomUUID()

    // 4. Simpan session
    await db.insert(sessions).values({
      userId: user[0]!.id,
      token: token,
    })

    return token
  }
}
