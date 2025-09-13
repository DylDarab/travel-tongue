import { z } from 'zod'

export const phraseSchema = z.object({
  order: z.number().int().min(0),
  group: z.string(),
  label: z.string().min(1).max(50),
  localDialogue: z.string().min(1).max(200),
  targetDialogue: z.string().min(1).max(200),
})

export const phrasesArraySchema = z.array(phraseSchema).min(20).max(24)

export type Phrase = z.infer<typeof phraseSchema>
export type PhrasesArray = z.infer<typeof phrasesArraySchema>
