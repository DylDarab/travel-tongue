import { type Events, type TurnState } from '@/lib/turnMachine'

export type Message = {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  translation?: string
  choices?: Array<{
    id: string
    label: string
    localAnswer: string
    targetAnswer: string
  }>
}

// Type for the message structure returned by the API
export type ApiMessage = {
  id: string
  text: string
  translatedText: string
  isUserMessage: boolean
  language: string | null
  timestamp: Date
  choices: string[] | undefined
  selectedChoice: string | undefined
}

export type RecordingState = 'idle' | 'recording' | 'processing'

export interface PageProps {
  params: Promise<{ id: string }>
}

export type { TurnState, Events }
