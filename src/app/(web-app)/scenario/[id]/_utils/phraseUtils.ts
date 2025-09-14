import type { GroupedPhrases, PhraseGroup } from './types'
import type { phrases, scenarios } from '@/server/db/schema/app'
import { USER_CUSTOM_GROUP } from '@/constants'

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

  const groupedEntries = Object.entries(groupedPhrases)

  const sortedGroups = groupedEntries.sort(([aTitle], [bTitle]) => {
    if (aTitle === USER_CUSTOM_GROUP) return -1
    if (bTitle === USER_CUSTOM_GROUP) return 1
    return aTitle.localeCompare(bTitle)
  })

  return sortedGroups.map(([title, phrases]) => ({
    id: title.toLowerCase().replace(/\s+/g, '-'),
    title,
    phrases,
  }))
}
