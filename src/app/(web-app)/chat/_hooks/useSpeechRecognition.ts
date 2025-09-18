import { useState, useEffect, useRef, useCallback } from 'react'
import { SpeechService } from '../_utils/speechService'

type SpeechRecognitionState = 'idle' | 'listening' | 'processing' | 'error'

interface UseSpeechRecognitionReturn {
  isListening: boolean
  isProcessing: boolean
  isSupported: boolean
  transcript: string
  error: string | null
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [state, setState] = useState<SpeechRecognitionState>('idle')
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const serviceRef = useRef<SpeechService | null>(null)

  // Initialize speech service
  useEffect(() => {
    serviceRef.current = new SpeechService()

    // Set up callbacks
    serviceRef.current.setOnFinalResult((text) => {
      setTranscript(text)
      setState('processing')
    })

    serviceRef.current.setOnInterimResult((text) => {
      setTranscript(text)
    })

    serviceRef.current.setOnSpeechError((errorMsg) => {
      setError(errorMsg)
      setState('error')
    })

    serviceRef.current.setOnTimeout(() => {
      setState('idle')
    })

    return () => {
      serviceRef.current?.destroy()
    }
  }, [])

  const startListening = useCallback(() => {
    if (!serviceRef.current?.isSupported()) {
      setError('Speech recognition not supported in this browser')
      setState('error')
      return
    }

    serviceRef.current.startListening()
    setState('listening')
    setError(null)
  }, [])

  const stopListening = useCallback(() => {
    serviceRef.current?.stopListening()
    setState('idle')
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  return {
    isListening: state === 'listening',
    isProcessing: state === 'processing',
    isSupported: serviceRef.current?.isSupported() ?? false,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}
