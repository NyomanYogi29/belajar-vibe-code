import { UserRepository } from '../repository/database/user-repository.ts'
import { SessionRepository } from '../repository/cache/session-repository.ts'
import type { RegisterDTO, LoginDTO, RefreshTokenDTO } from '../contracts/index.ts'
import { sign, verify } from 'hono/jwt'

export class UserService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'supersecret'
  private static readonly ACCESS_TOKEN_EXPIRE = 3600 // 1 hour
  private static readonly REFRESH_TOKEN_EXPIRE = 7 * 24 * 3600 // 7 days (as example)

  static async registerUser(payload: RegisterDTO) {
    const { name, email, password } = payload
    const existingUser = await UserRepository.findActiveUserByEmail(email)
    if (existingUser) throw new Error('User already exists')

    const hashedPassword = await Bun.password.hash(password)
    await UserRepository.createUser({
      name,
      email,
      password: hashedPassword,
      role: 'MURID',
    })
    return 'OK'
  }

  static async loginUser(payload: LoginDTO, ipAddress: string, userAgent: string) {
    const { email, password } = payload
    const user = await UserRepository.findActiveUserByEmail(email)
    if (!user) throw new Error('Email atau password salah')

    const isPasswordValid = await Bun.password.verify(password, user.password)
    if (!isPasswordValid) throw new Error('Email atau password salah')

    const sessionId = crypto.randomUUID()
    
    const accessToken = await sign({
      userId: user.id,
      sessionId,
      exp: Math.floor(Date.now() / 1000) + this.ACCESS_TOKEN_EXPIRE
    }, this.JWT_SECRET, 'HS256')

    const refreshToken = await sign({
      userId: user.id,
      sessionId,
      exp: Math.floor(Date.now() / 1000) + this.REFRESH_TOKEN_EXPIRE
    }, this.JWT_SECRET, 'HS256')

    await SessionRepository.setSession(user.id, sessionId, {
      refreshToken,
      ipAddress,
      userAgent
    }, this.REFRESH_TOKEN_EXPIRE)

    return { accessToken, refreshToken }
  }

  static async refreshToken(payload: RefreshTokenDTO, ipAddress: string, userAgent: string) {
    const { refreshToken } = payload
    
    try {
      const decoded = await verify(refreshToken, this.JWT_SECRET, 'HS256') as any
      const { userId, sessionId } = decoded

      const session = await SessionRepository.getSession(userId, sessionId)
      if (!session || session.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token')
      }

      // Rotate token: delete old, create new
      await SessionRepository.deleteSession(userId, sessionId)

      const newSessionId = crypto.randomUUID()
      const newAccessToken = await sign({
        userId,
        sessionId: newSessionId,
        exp: Math.floor(Date.now() / 1000) + this.ACCESS_TOKEN_EXPIRE
      }, this.JWT_SECRET, 'HS256')

      const newRefreshToken = await sign({
        userId,
        sessionId: newSessionId,
        exp: Math.floor(Date.now() / 1000) + this.REFRESH_TOKEN_EXPIRE
      }, this.JWT_SECRET, 'HS256')

      await SessionRepository.setSession(userId, newSessionId, {
        refreshToken: newRefreshToken,
        ipAddress,
        userAgent
      }, this.REFRESH_TOKEN_EXPIRE)

      return { accessToken: newAccessToken, refreshToken: newRefreshToken }
    } catch (err) {
      throw new Error('Session expired or invalid')
    }
  }
}
