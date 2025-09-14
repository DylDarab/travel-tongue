import type { GroupedPhrases, PhraseGroup } from './types'
import type { phrases, scenarios } from '@/server/db/schema/app'

type Phrase = typeof phrases.$inferSelect

export function groupPhrasesByGroup(
  phrases: Phrase[],
  scenario: typeof scenarios.$inferSelect,
): PhraseGroup[] {
  const groupedPhrases = phrases.reduce<GroupedPhrases>((acc, phrase) => {
    const group = phrase.group ?? 'General'
    acc[group] ??= []
    acc[group].push({
      id: phrase.id,
      label: phrase.label,
      localDialogue: phrase.localDialogue,
      targetDialogue: phrase.targetDialogue,
      speakLang: scenario.targetLang,
    })
    return acc
  }, {} as GroupedPhrases)

  return Object.entries(groupedPhrases).map(([title, phrases]) => ({
    id: title.toLowerCase().replace(/\s+/g, '-'),
    title,
    phrases,
  }))
}
