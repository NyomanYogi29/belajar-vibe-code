import { UserRepository } from '../repository/user-repository.ts'
import type { RegisterDTO, LoginDTO } from '../contracts/index.ts'

export class UserService {
  static async registerUser(payload: RegisterDTO) {
    const { name, email, password } = payload

    // 1. Pengecekan apakah user aktif dengan email tersebut sudah ada
    const existingUser = await UserRepository.findActiveUserByEmail(email)

    if (existingUser) {
      throw new Error('User already exists')
    }

    // 2. Hash password menggunakan Bun built-in crypto
    const hashedPassword = await Bun.password.hash(password)

    // 3. Simpan user baru ke database
    await UserRepository.createUser({
      name,
      email,
      password: hashedPassword,
      role: 'MURID', // default role
    })

    return 'OK'
  }

  static async loginUser(payload: LoginDTO) {
    const { email, password } = payload

    // 1. Cari user yang aktif
    const user = await UserRepository.findActiveUserByEmail(email)

    if (!user) {
      throw new Error('Email atau password salah')
    }

    // 2. Verifikasi password
    const isPasswordValid = await Bun.password.verify(password, user.password)

    if (!isPasswordValid) {
      throw new Error('Email atau password salah')
    }

    // 3. Generate token UUID
    const token = crypto.randomUUID()

    // 4. Simpan session
    await UserRepository.createSession(user.id, token)

    return token
  }
}
