import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { UserService } from '../services/user-service.ts'

const userRoute = new Hono()

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})

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

export { userRoute }
