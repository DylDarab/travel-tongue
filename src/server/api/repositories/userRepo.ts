import { eq } from 'drizzle-orm'
import { db } from '@/server/db'
import { users } from '@/server/db/schema/auth'

export async function getUserById(id: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
  })
}

export async function isUserProfileComplete(id: string): Promise<boolean> {
  const user = await getUserById(id)

  if (!user) return false

  return !!(user.realName && user.gender && user.preferredLanguage)
}

export async function updateUserProfile(
  id: string,
  data: Partial<typeof users.$inferInsert>,
) {
  const existingUser = await getUserById(id)
  if (!existingUser) {
    throw new Error('User not found')
  }

  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined),
  )

  const updatedData = { ...existingUser, ...filteredData }

  return await db.update(users).set(updatedData).where(eq(users.id, id))
}
