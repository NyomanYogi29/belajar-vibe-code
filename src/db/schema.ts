import { pgTable, text, timestamp, uuid, varchar, integer, boolean, pgEnum, unique } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['MURID', 'GURU', 'ADMIN'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  tryoutAttempt: integer('tryoutAttempt').default(0).notNull(),
  totalPoint: integer('totalPoint').default(0).notNull(),
  coinBalance: integer('coinBalance').default(0).notNull(),
  role: roleEnum('role').default('MURID').notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  blockedUntil: timestamp('blockedUntil'),
  deletedAt: timestamp('deletedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  avatar: text('avatar'),
}, (table) => ({
  uniqueEmailDeletedAt: unique().on(table.email, table.deletedAt),
}))

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').notNull().references(() => users.id),
  token: varchar('token', { length: 255 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})
