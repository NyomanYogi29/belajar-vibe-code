import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { UserService } from '../services/user-service.ts'
import { registerSchema, loginSchema } from '../contracts/user-contract.ts'

const userRoute = new Hono()

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

  try {
    const token = await UserService.loginUser(payload)
    return c.json({
      message: 'Login berhasil',
      data: token,
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

export { userRoute }
