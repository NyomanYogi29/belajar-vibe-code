import { z } from 'zod'
import type { Context, Next } from 'hono'
import { validator } from 'hono/validator'

export const validateBody = (schema: z.ZodSchema) => {
  return validator('json', (value, c) => {
    const result = schema.safeParse(value)
    if (!result.success) {
      return c.json({ error: result.error.flatten() }, 400)
    }
    return result.data
  })
}
