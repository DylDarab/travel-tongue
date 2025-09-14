import { desc, eq, sql } from 'drizzle-orm'
import { db } from '@/server/db'
import { phrases, scenarios } from '@/server/db/schema/app'
import { generateScenarioPhrases } from './phraseService'
import { isEmpty } from 'lodash'

export async function getScenarioById(id: string) {
  return await db.query.scenarios.findFirst({
    where: eq(scenarios.id, id),
  })
}

export async function deleteScenarioById(id: string) {
  return await db.delete(scenarios).where(eq(scenarios.id, id))
}

export async function getScenariosList(
  userId: string,
  cursor?: string,
  limit = 10,
) {
  const cursorDate = cursor ? new Date(cursor) : undefined

  return await db
    .select({
      id: scenarios.id,
      title: scenarios.title,
      context: scenarios.context,
      targetLang: scenarios.targetLang,
      tags: scenarios.tags,
      pinned: scenarios.pinned,
      userId: scenarios.userId,
      createdAt: scenarios.createdAt,
      updatedAt: scenarios.updatedAt,
      phraseCount: sql<number>`COALESCE(COUNT(${phrases.id}), 0)`,
    })
    .from(scenarios)
    .leftJoin(phrases, eq(phrases.scenarioId, scenarios.id))
    .where(
      cursorDate
        ? sql`${scenarios.userId} = ${userId} AND ${scenarios.updatedAt} < ${cursorDate}`
        : eq(scenarios.userId, userId),
    )
    .groupBy(scenarios.id)
    .orderBy(desc(scenarios.updatedAt))
    .limit(limit + 1)
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
    orderBy: [phrases.order, phrases.group],
  })
}

export async function getScenarioWithPhrases(scenarioId: string) {
  const scenario = await getScenarioById(scenarioId)
  if (!scenario) {
    return null
  }

  const phrases = await getScenarioPhrases(scenarioId)

  const groupedPhrases = phrases.reduce(
    (acc, phrase) => {
      const group = phrase.group ?? 'General'
      acc[group] ??= []
      acc[group].push({
        id: phrase.id,
        english: phrase.label,
        translation: phrase.targetDialogue,
        speakLang: scenario.targetLang,
      })
      return acc
    },
    {} as Record<
      string,
      Array<{
        id: string
        english: string
        translation: string
        speakLang: string
      }>
    >,
  )

  return {
    ...scenario,
    phraseGroups: Object.entries(groupedPhrases).map(([title, phrases]) => ({
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      phrases,
    })),
  }
}
