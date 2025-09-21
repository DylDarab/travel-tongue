'use client'

import { useState } from 'react'

interface PhraseCardProps {
  label: string
  displayText: string
  speakText: string
  speakLang: string
  onSend?: () => void
  disabled?: boolean
}

const PhraseCard: React.FC<PhraseCardProps> = ({
  label,
  displayText,
  speakText,
  speakLang,
  onSend,
  disabled = false,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true)

      const utterance = new SpeechSynthesisUtterance(speakText)
      utterance.rate = 0.7
      utterance.pitch = 1
      utterance.lang = speakLang

      utterance.onend = () => {
        setIsSpeaking(false)
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
      }

      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="flex-1">
        <p className="text-lg font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{displayText}</p>
      </div>
      <div className="mt-2 flex justify-end gap-2">
        {onSend && (
          <button
            className="rounded bg-teal-100 px-2 py-1 text-xs font-medium text-teal-700 hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onSend}
            disabled={disabled}
            aria-label={`Send "${label}" as reply`}
          >
            Send
          </button>
        )}
        <button
          className={`rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 ${isSpeaking ? 'animate-pulse' : ''}`}
          onClick={handleSpeak}
          aria-label={`Speak "${label}"`}
        >
          Speak
        </button>
      </div>
    </div>
  )
}

export default PhraseCard
