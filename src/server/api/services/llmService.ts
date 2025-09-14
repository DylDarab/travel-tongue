import { env } from '@/env'
import OpenAI from 'openai'
import type { z } from 'zod'

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
