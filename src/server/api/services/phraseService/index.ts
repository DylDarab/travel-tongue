import { db } from '@/server/db'
import { phrases } from '@/server/db/schema/app'
import { replaceVariableInPrompt } from '@/utils/promptsUtils'
import { eq, sql } from 'drizzle-orm'
import { generateContent, translateText } from '../llmService'
import { getScenarioById } from '../scenarioService'
import { getUserById } from '../userService'
import {
  GENERATE_PHRASES_PROMPT,
  GENERATE_PHRASE_FROM_LABEL_PROMPT,
} from './prompts'
import {
  phrasesArraySchema,
  phraseFromLabelSchema,
  type Phrase,
  type PhrasesArray,
  type PhraseFromLabel,
} from './types'

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
    generatedPhrases.map((phrase: Phrase) => ({
      ...phrase,
      scenarioId,
    })),
  )

  return generatedPhrases
}

export async function translatePhrase(
  englishPhrase: string,
  targetLang: string,
  context?: string,
): Promise<string | null> {
  try {
    const translation = await translateText(englishPhrase, targetLang, context)
    if (!translation) {
      return null
    }
    return translation
  } catch (error) {
    console.error('Translation error:', error)
    return null
  }
}

export async function addPhraseToScenario(
  scenarioId: string,
  phraseData: {
    label: string
    localDialogue: string
    targetDialogue: string
    group: string
  },
): Promise<boolean> {
  try {
    const maxOrderResult = await db
      .select({ maxOrder: sql<number>`max(${phrases.order})` })
      .from(phrases)
      .where(eq(phrases.scenarioId, scenarioId))

    const maxOrder = maxOrderResult[0]?.maxOrder ?? 0
    const newOrder = maxOrder + 1

    await db.insert(phrases).values({
      scenarioId,
      order: newOrder,
      label: phraseData.label,
      localDialogue: phraseData.localDialogue,
      targetDialogue: phraseData.targetDialogue,
      group: phraseData.group,
    })

    return true
  } catch (error) {
    console.error('Error adding phrase to scenario:', error)
    return false
  }
}

export async function generatePhraseFromLabel(
  label: string,
  scenarioId: string,
  targetLang: string,
  userId: string,
): Promise<PhraseFromLabel | null> {
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

  const prompt = replaceVariableInPrompt(GENERATE_PHRASE_FROM_LABEL_PROMPT, {
    label,
    scenarioContext: scenario.context ?? scenario.title,
    targetLang,
    userInfo: JSON.stringify(userInfo),
  })

  const generatedPhrase = await generateContent<PhraseFromLabel>(
    prompt,
    phraseFromLabelSchema,
    3,
  )

  return generatedPhrase
}
