import { replaceVariableInPrompt } from '@/utils/promptsUtils'
import { generateContent } from '../llmService'
import { GENERATE_PHRASES_PROMPT } from './prompts'
import { getScenarioById } from '../scenarioService'
import { getUserById } from '../userService'
import { phrasesArraySchema, type PhrasesArray } from './types'
import { db } from '@/server/db'
import { phrases } from '@/server/db/schema/app'
import { eq } from 'drizzle-orm'

export async function generateScenarioPhrases(
  scenarioId: string,
  userId: string,
) {
  const scenario = await getScenarioById(scenarioId)
  if (!scenario) {
    return null
  }

  const user = await getUserById(userId)
  if (!user) {
    return null
  }

  const userInfo = {
    displayName: user.displayName,
    gender: user.gender,
    preferredLanguage: user.preferredLanguage,
    travelPreferences: user.travelPreferences,
    foodAllergies: user.foodAllergies,
    religion: user.religion,
    personalNotes: user.personalNotes,
  }

  const prompt = replaceVariableInPrompt(GENERATE_PHRASES_PROMPT, {
    userInput: JSON.stringify(scenario),
    userInfo: JSON.stringify(userInfo),
  })

  const generatedPhrases = await generateContent<PhrasesArray>(
    prompt,
    phrasesArraySchema,
    3,
  )
  if (!generatedPhrases) {
    return null
  }

  await db.delete(phrases).where(eq(phrases.scenarioId, scenarioId))

  await db.insert(phrases).values(
    generatedPhrases.map((phrase) => ({
      ...phrase,
      scenarioId,
    })),
  )

  return generatedPhrases
}
