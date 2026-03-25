import { jwt } from 'hono/jwt'

export const authMiddleware = (secret: string) => {
  return jwt({
    secret,
    alg: 'HS256',
  })
}
