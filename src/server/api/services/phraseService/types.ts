import { z } from 'zod'

export const phraseSchema = z.object({
  order: z.number().int(),
  group: z.string(),
  label: z.string().min(1).max(100),
  localDialogue: z.string().min(1).max(300),
  targetDialogue: z.string().min(1).max(300),
})

export const phrasesArraySchema = z.array(phraseSchema).min(10).max(30)

export type Phrase = z.infer<typeof phraseSchema>
export const phraseFromLabelSchema = z.object({
  label: z.string().min(1).max(100),
  localDialogue: z.string().min(1).max(300),
  targetDialogue: z.string().min(1).max(300),
  group: z.string(),
})

export type PhraseFromLabel = z.infer<typeof phraseFromLabelSchema>
export type PhrasesArray = z.infer<typeof phrasesArraySchema>
