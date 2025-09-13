import { env } from '@/env'
import { GoogleGenAI } from '@google/genai'
import type { z } from 'zod'

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
})

export async function generateContent<T>(
  prompt: string,
  validationSchema: z.ZodSchema,
  retryTime = 3,
): Promise<T | null> {
  let retryAttempts = 0
  do {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })
    const parsedResponse = await validationSchema.safeParseAsync(response.text)
    if (parsedResponse.success) {
      return parsedResponse.data as T
    }
    retryAttempts++
  } while (retryAttempts < retryTime)
  return null
}
