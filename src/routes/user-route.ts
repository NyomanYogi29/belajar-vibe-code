import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { UserService } from '../services/user-service.ts'
import { registerSchema, loginSchema, refreshTokenSchema } from '../contracts/user-contract.ts'
import { jwt } from 'hono/jwt'

const userRoute = new Hono()

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'

userRoute.post('/register', zValidator('json', registerSchema), async (c) => {
  const payload = c.req.valid('json')

  try {
    await UserService.registerUser(payload)
    return c.json({
      message: 'User created successfully',
      data: 'OK',
    }, 201)
  } catch (err: any) {
    if (err.message === 'User already exists') {
      return c.json({
        message: 'User already exists',
        data: 'ERROR',
      }, 400)
    }
    return c.json({
      message: err.message || 'Internal server error',
      data: 'ERROR',
    }, 500)
  }
})

userRoute.post('/login', zValidator('json', loginSchema), async (c) => {
  const payload = c.req.valid('json')
  const ipAddress = c.req.header('x-forwarded-for') || '127.0.0.1'
  const userAgent = c.req.header('user-agent') || 'unknown'

  try {
    const tokens = await UserService.loginUser(payload, ipAddress, userAgent)
    return c.json({
      message: 'Login berhasil',
      data: tokens,
    })
  } catch (err: any) {
    if (err.message === 'Email atau password salah') {
      return c.json({
        message: 'Email atau password salah',
        data: 'ERROR',
      }, 401)
    }
    return c.json({
      message: err.message || 'Internal server error',
      data: 'ERROR',
    }, 500)
  }
})

userRoute.post('/refresh-token', zValidator('json', refreshTokenSchema), async (c) => {
  const payload = c.req.valid('json')
  const ipAddress = c.req.header('x-forwarded-for') || '127.0.0.1'
  const userAgent = c.req.header('user-agent') || 'unknown'

  try {
    const tokens = await UserService.refreshToken(payload, ipAddress, userAgent)
    return c.json({
      message: 'Token berhasil di-refresh',
      data: tokens,
    })
  } catch (err: any) {
    return c.json({
      message: err.message || 'Internal server error',
      data: 'ERROR',
    }, 401)
  }
})

// Protected root endpoint
userRoute.get('/', jwt({ secret: JWT_SECRET, alg: 'HS256' }), (c) => {
  const payload = c.get('jwtPayload')
  return c.json({
    message: 'Welcome to protected root!',
    user: payload,
  })
})

export { userRoute }
