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
  console.log('🚀 ~ generateContent ~ prompt:', prompt)
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
  console.log('🚀 ~ generateTextContent ~ prompt:', prompt)
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
  _context?: string,
): Promise<string | null> {
  console.log('🚀 ~ translateText ~ targetLang:', targetLang)
  console.log('🚀 ~ translateText ~ englishPhrase:', englishPhrase)
  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${env.GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: englishPhrase,
          target: targetLang,
          format: 'text',
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `HTTP ${response.status} ${response.statusText}: ${errorText}`,
      )
    }

    const json = (await response.json()) as {
      data?: { translations?: Array<{ translatedText: string }> }
    }

    const translatedText = json.data?.translations?.[0]?.translatedText
    if (!translatedText) {
      return null
    }

    return decodeHtmlEntities(translatedText)
  } catch (error) {
    console.error('Google Translate API error:', error)
    return null
  }
}

function decodeHtmlEntities(text: string) {
  return text
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&#x2F;', '/')
    .replaceAll('&#x60;', '`')
    .replaceAll('&#x3D;', '=')
}
