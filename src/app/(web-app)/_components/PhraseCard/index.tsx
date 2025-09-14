'use client'

import { Volume2 } from 'lucide-react'
import { useState } from 'react'

interface PhraseCardProps {
  english: string
  translation: string
  speakLang: string
}

const PhraseCard: React.FC<PhraseCardProps> = ({
  english,
  translation,
  speakLang,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true)

      const utterance = new SpeechSynthesisUtterance(translation)
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
      <div>
        <p className="mb-1 font-medium text-gray-900">{english}</p>
        <p className="text-sm text-gray-600">{translation}</p>
      </div>
      <button
        onClick={handleSpeak}
        className={`rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 ${isSpeaking ? 'animate-pulse' : ''}`}
      >
        <Volume2 />
      </button>
    </div>
  )
}

export default PhraseCard
