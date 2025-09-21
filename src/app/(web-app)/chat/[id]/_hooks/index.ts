import { SPEECH_LANG_MAP } from '../_constants'

export function resolveSpeechLang(lang?: string) {
  if (!lang) return 'ja-JP'
  const key = lang.toLowerCase()
  return SPEECH_LANG_MAP[key] ?? `${key}-${key.toUpperCase()}`
}

export function speakText(text: string, lang: string) {
  return new Promise<void>((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve()
      return
    }

    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 1
      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()
      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.warn('speechSynthesis failed', error)
      resolve()
    }
  })
}
