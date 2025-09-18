'use client'

import { X } from 'lucide-react'
import Button from '@/components/Button'
import { useEffect } from 'react'

interface TranslationPromptProps {
  detectedJapanese: string
  translatedEnglish: string
  onDismiss: () => void
  onStartConversation: (translatedText: string) => void
}

export function TranslationPrompt({
  detectedJapanese,
  translatedEnglish,
  onDismiss,
  onStartConversation,
}: TranslationPromptProps) {
  const handleStartConversation = () => {
    onStartConversation(translatedEnglish)
  }

  const handleDismiss = () => {
    onDismiss()
  }

  // Handle escape key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss()
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [onDismiss])

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div
        className="w-[90vw] max-w-md rounded-2xl bg-white p-6 shadow-lg focus:outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="translation-dialog-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="translation-dialog-title"
            className="text-xl font-bold text-gray-900"
          >
            Translation Detected
          </h2>
          <button
            onClick={handleDismiss}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-500">Japanese</h3>
            <div className="rounded-xl bg-teal-50 p-4">
              <p className="text-lg font-medium text-gray-900">
                {detectedJapanese}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-500">
              English Translation
            </h3>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-lg text-gray-900">{translatedEnglish}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              label="Dismiss"
              variant="outline"
              onClick={handleDismiss}
              className="flex-1 py-3 text-base"
            />
            <Button
              label="Start Conversation"
              onClick={handleStartConversation}
              className="flex-1 py-3 text-base"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
