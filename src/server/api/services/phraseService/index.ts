import { replaceVariableInPrompt } from '@/utils/promptsUtils'
import { generateContent } from '../llmService'
import { GENERATE_PHRASES_PROMPT } from './prompts'
import { getScenarioById } from '../scenarioService'
import { phrasesArraySchema, type PhrasesArray } from './types'
import { db } from '@/server/db'
import { phrases } from '@/server/db/schema/app'

export async function generateScenarioPhrases(scenarioId: string) {
  const scenario = await getScenarioById(scenarioId)
  if (!scenario) {
    return null
  }

  const prompt = replaceVariableInPrompt(GENERATE_PHRASES_PROMPT, {
    userInput: JSON.stringify(scenario),
  })

  const generatedPhrases = await generateContent<PhrasesArray>(
    prompt,
    phrasesArraySchema,
    3,
  )
  if (!generatedPhrases) {
    return null
  }

  await db.insert(phrases).values(
    generatedPhrases.map((phrase) => ({
      ...phrase,
      scenarioId,
    })),
  )

  return generatedPhrases
}
