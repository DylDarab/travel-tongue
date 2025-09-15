'use client'

import { Volume2 } from 'lucide-react'
import { useState } from 'react'

interface PhraseCardProps {
  label: string
  displayText: string
  speakText: string
  speakLang: string
}

const PhraseCard: React.FC<PhraseCardProps> = ({
  label,
  displayText,
  speakText,
  speakLang,
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
      <button
        onClick={handleSpeak}
        className={`min-h-[48px] min-w-[48px] touch-manipulation rounded-full p-3 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 ${isSpeaking ? 'animate-pulse' : ''}`}
      >
        <Volume2 className="h-6 w-6" />
      </button>
    </div>
  )
}

export default PhraseCard
