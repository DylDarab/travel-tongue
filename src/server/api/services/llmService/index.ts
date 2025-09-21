import { env } from '@/env'
import OpenAI from 'openai'
import type { z } from 'zod'
import { replaceVariableInPrompt } from '@/utils/promptsUtils'
import { TRANSLATE_PHRASE_PROMPT } from './prompts'

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

export async function generateContent<T>(
  prompt: string,
  validationSchema: z.ZodSchema,
  maxRetries = 3,
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4.1-nano',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      })

      const content = response.choices[0]?.message?.content
      console.log('🚀 ~ generateContent ~ content:', content)
      if (!content) {
        throw new Error('No content in response')
      }

      let parsedContent
      try {
        parsedContent = JSON.parse(content) as T
      } catch (parseError) {
        console.log('❌ JSON parse failed:', parseError)
        throw new Error('Invalid JSON response')
      }

      const parsedResponse =
        await validationSchema.safeParseAsync(parsedContent)

      if (parsedResponse.success) {
        return parsedResponse.data as T
      } else {
        console.log(
          '🚀 ~ generateContent ~ parsedResponse:',
          JSON.stringify(parsedResponse.error, null, 2),
        )
      }

      console.log(`❌ Validation failed on attempt ${attempt}/${maxRetries}`)
    } catch (error) {
      console.log(
        `❌ API call failed on attempt ${attempt}/${maxRetries}:`,
        error,
      )
    }

    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
    }
  }

  return null
}

export async function generateTextContent(
  prompt: string,
  maxRetries = 3,
): Promise<string | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      })

      const content = response.choices[0]?.message?.content
      console.log('🚀 ~ generateTextContent ~ content:', content)
      if (!content) {
        throw new Error('No content in response')
      }

      return content
    } catch (error) {
      console.log(
        `❌ API call failed on attempt ${attempt}/${maxRetries}:`,
        error,
      )
    }

    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
    }
  }

  return null
}

export async function translateText(
  englishPhrase: string,
  targetLang: string,
  context?: string,
): Promise<string | null> {
  console.log('🚀 ~ translateText ~ targetLang:', targetLang)
  console.log('🚀 ~ translateText ~ englishPhrase:', englishPhrase)

  const prompt = replaceVariableInPrompt(TRANSLATE_PHRASE_PROMPT, {
    englishPhrase,
    targetLang,
    ...(context && { context }),
  })

  console.log('🚀 ~ translateText ~ prompt:', prompt)

  const result = await generateTextContent(prompt, 3)
  return result
}
