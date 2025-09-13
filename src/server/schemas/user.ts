import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { users } from '@/server/db/schema/auth'

export const userInsertSchema = createInsertSchema(users)
export const userSelectSchema = createSelectSchema(users)
export const userUpdateSchema = userInsertSchema.partial()

export type User = typeof userSelectSchema
export type UserInsert = typeof userInsertSchema
export type UserUpdate = typeof userUpdateSchema
