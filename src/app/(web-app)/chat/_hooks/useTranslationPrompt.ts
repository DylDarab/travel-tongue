import { useState, useCallback } from 'react'

interface UseTranslationPromptReturn {
  isOpen: boolean
  japaneseText: string
  englishTranslation: string
  isLoading: boolean
  error: string | null
  openPrompt: (japaneseText: string, englishTranslation: string) => void
  closePrompt: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useTranslationPrompt = (): UseTranslationPromptReturn => {
  const [isOpen, setIsOpen] = useState(false)
  const [japaneseText, setJapaneseText] = useState('')
  const [englishTranslation, setEnglishTranslation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openPrompt = useCallback(
    (japaneseText: string, englishTranslation: string) => {
      setJapaneseText(japaneseText)
      setEnglishTranslation(englishTranslation)
      setIsOpen(true)
      setError(null)
    },
    [],
  )

  const closePrompt = useCallback(() => {
    setIsOpen(false)
    setJapaneseText('')
    setEnglishTranslation('')
    setIsLoading(false)
    setError(null)
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  const setErrorCallback = useCallback((error: string | null) => {
    setError(error)
  }, [])

  return {
    isOpen,
    japaneseText,
    englishTranslation,
    isLoading,
    error,
    openPrompt,
    closePrompt,
    setLoading,
    setError: setErrorCallback,
  }
}
