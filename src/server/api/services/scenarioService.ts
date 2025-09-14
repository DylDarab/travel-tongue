import { desc, eq } from 'drizzle-orm'
import { db } from '@/server/db'
import { users } from '@/server/db/schema/auth'
import { phrases, scenarios } from '@/server/db/schema/app'
import { generateScenarioPhrases } from './phraseService'
import { isEmpty } from 'lodash'

export async function getScenarioById(id: string) {
  return await db.query.scenarios.findFirst({
    where: eq(users.id, id),
  })
}

export async function deleteScenarioById(id: string) {
  return await db.delete(scenarios).where(eq(scenarios.id, id))
}

export async function getScenariosList(userId: string) {
  return await db.query.scenarios.findMany({
    where: eq(scenarios.userId, userId),
    limit: 10,
    orderBy: [desc(scenarios.updatedAt)],
  })
}

export async function createScenario(data: typeof scenarios.$inferInsert) {
  const createdScenario = await db.insert(scenarios).values(data).returning()

  if (isEmpty(createdScenario)) {
    return null
  }

  const phrases = await generateScenarioPhrases(
    createdScenario?.[0]?.id ?? '',
    data.userId ?? '',
  )
  if (isEmpty(phrases)) {
    return null
  }

  return createdScenario?.[0]
}

export async function getScenarioPhrases(scenarioId: string) {
  return await db.query.phrases.findMany({
    where: eq(phrases.scenarioId, scenarioId),
  })
}
