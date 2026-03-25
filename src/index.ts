import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { db } from './db/index.ts'
import { redis } from './lib/redis.ts'
import { users } from './db/schema.ts'

const app = new Hono()

app.use('*', logger())

// Base route
app.get('/', (c) => {
  return c.text('Welcome to Bun-Hono Backend!')
})

// Verification endpoint
app.get('/ping', async (c) => {
  let dbStatus = 'Disconnected'
  let redisStatus = 'Disconnected'

  try {
    // Check DB (simple query)
    await db.select().from(users).limit(1)
    dbStatus = 'Connected'
  } catch (err) {
    dbStatus = `Error: ${err instanceof Error ? err.message : String(err)}`
  }

  try {
    // Check Redis
    const pong = await redis.ping()
    redisStatus = pong === 'PONG' ? 'Connected' : `Error: ${pong}`
  } catch (err) {
    redisStatus = `Error: ${err instanceof Error ? err.message : String(err)}`
  }

  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      redis: redisStatus
    }
  })
})

export default {
  port: 3000,
  fetch: app.fetch,
}
