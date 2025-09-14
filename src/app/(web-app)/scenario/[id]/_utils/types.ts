export interface PhraseGroup {
  id: string
  title: string
  phrases: PhraseItem[]
}

export interface PhraseItem {
  id: string
  label: string
  localDialogue: string
  targetDialogue: string
  speakLang: string
}

export type GroupedPhrases = Record<string, PhraseItem[]>
