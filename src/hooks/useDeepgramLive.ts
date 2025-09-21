import { useCallback, useEffect, useRef, useState } from 'react'
import { LiveTranscriptionEvents, createClient } from '@deepgram/sdk'
import type { LiveTranscriptionEvent } from '@deepgram/sdk'

type Options = {
  model?: string
  language?: string
  interimResults?: boolean
  smartFormat?: boolean
  punctuate?: boolean
  endpointing?: boolean
  utteranceEndMs?: number
  noDelay?: boolean
  encoding?: string
}

type TokenResponse = {
  accessToken?: string
  expiresIn?: number
  error?: string
}

type LiveConnection = {
  disconnect: (code?: number, reason?: string) => void
  requestClose: () => void
  send: (data: ArrayBuffer) => void
  on: (event: LiveTranscriptionEvents, handler: (data: unknown) => void) => void
}

export function useDeepgramLive(opts?: Options) {
  const [connected, setConnected] = useState(false)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [finals, setFinals] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const dgRef = useRef<LiveConnection | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mutedRef = useRef(false)
  const shouldListenRef = useRef(false)
  const connectingRef = useRef(false)

  const resetMedia = useCallback(() => {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null

    streamRef.current?.getTracks().forEach((track) => {
      track.stop()
    })
    streamRef.current = null

    setListening(false)
  }, [])

  const teardownConnection = useCallback(() => {
    const connection = dgRef.current
    dgRef.current = null

    if (connection) {
      if (typeof connection.requestClose === 'function') {
        try {
          connection.requestClose()
        } catch (err) {
          console.warn('Deepgram requestClose failed', err)
        }
      }
      if (typeof connection.disconnect === 'function') {
        try {
          connection.disconnect()
        } catch (err) {
          console.warn('Deepgram disconnect failed', err)
        }
      }
    }

    setConnected(false)
    setInterim('')
  }, [])

  const connect = useCallback(async () => {
    if (connectingRef.current || !shouldListenRef.current) return
    connectingRef.current = true

    try {
      setError(null)

      const response = await fetch('/api/deepgram/token', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error(`Token fetch failed (${response.status})`)
      }

      const { accessToken, error: tokenError } =
        (await response.json()) as TokenResponse
      if (tokenError) {
        throw new Error(tokenError)
      }
      if (!accessToken) {
        throw new Error('No access token returned')
      }

      const client = createClient({ accessToken })
      const languageOption = opts?.language ?? 'ja'
      const [languageCode] = languageOption.split('-')
      const normalizedLanguage =
        languageCode && languageCode.trim().length > 0 ? languageCode : 'ja'

      const liveOptions: Record<string, unknown> = {
        model: opts?.model ?? 'nova-2',
        language: normalizedLanguage,
        interim_results: opts?.interimResults ?? true,
        punctuate: opts?.punctuate ?? true,
        smart_format: opts?.smartFormat ?? true,
        encoding: opts?.encoding ?? 'opus',
        endpointing: opts?.endpointing ?? 2500,
        utterance_end_ms: opts?.utteranceEndMs ?? 1500,
        no_delay: opts?.noDelay ?? true,
      }

      const connection = client.listen.live(
        liveOptions,
      ) as unknown as LiveConnection

      connection.on(LiveTranscriptionEvents.Open, () => {
        void (async () => {
          setConnected(true)

          if (
            typeof navigator === 'undefined' ||
            !navigator.mediaDevices?.getUserMedia
          ) {
            setError('Microphone access is unavailable')
            if (typeof connection.requestClose === 'function') {
              connection.requestClose()
            }
            if (typeof connection.disconnect === 'function') {
              connection.disconnect()
            }
            return
          }

          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: true,
            })
            streamRef.current = stream

            const mimeType = MediaRecorder.isTypeSupported('audio/webm')
              ? 'audio/webm'
              : undefined

            const recorder = new MediaRecorder(
              stream,
              mimeType ? { mimeType } : undefined,
            )
            mediaRecorderRef.current = recorder

            recorder.ondataavailable = (event) => {
              if (mutedRef.current) return
              if (event.data.size > 0) {
                void event.data.arrayBuffer().then((buffer) => {
                  try {
                    connection.send(buffer)
                  } catch (sendError) {
                    console.error(
                      'Failed to send audio chunk to Deepgram',
                      sendError,
                    )
                  }
                })
              }
            }

            recorder.start(250)
            setListening(true)
          } catch (mediaError) {
            const message =
              mediaError instanceof Error
                ? mediaError.message
                : 'Unable to access microphone'
            setError(message)
            if (typeof connection.requestClose === 'function') {
              connection.requestClose()
            }
            if (typeof connection.disconnect === 'function') {
              connection.disconnect()
            }
          }
        })()
      })

      connection.on(LiveTranscriptionEvents.Transcript, (payload: unknown) => {
        const event = payload as Partial<LiveTranscriptionEvent> | null
        const alternative = event?.channel?.alternatives?.[0]
        const text = alternative?.transcript ?? ''
        const isFinal = Boolean(event?.is_final ?? event?.speech_final ?? false)

        if (!text) return
        if (isFinal) {
          const finalText = text.trim()
          if (finalText) {
            setFinals([finalText])
          }
          setInterim('')
        } else {
          setInterim(text)
        }
      })

      const handleCloseOrError = (event?: unknown) => {
        console.warn('Deepgram connection closed', event)
        resetMedia()
        teardownConnection()

        if (shouldListenRef.current) {
          setTimeout(() => {
            void connect()
          }, 500)
        }
      }

      connection.on(LiveTranscriptionEvents.Close, handleCloseOrError)
      connection.on(LiveTranscriptionEvents.Error, (event) => {
        setError('Transcription error')
        handleCloseOrError(event)
      })

      dgRef.current = connection
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to connect to Deepgram'
      setError(message)
      resetMedia()
      teardownConnection()
    } finally {
      connectingRef.current = false
    }
  }, [
    opts?.model,
    opts?.language,
    opts?.interimResults,
    opts?.smartFormat,
    opts?.punctuate,
    opts?.endpointing,
    opts?.utteranceEndMs,
    opts?.noDelay,
    opts?.encoding,
    resetMedia,
    teardownConnection,
  ])

  const start = useCallback(async () => {
    shouldListenRef.current = true
    await connect()
  }, [connect])

  const stop = useCallback(() => {
    shouldListenRef.current = false
    resetMedia()
    teardownConnection()
  }, [resetMedia, teardownConnection])

  const mute = useCallback((muted: boolean) => {
    mutedRef.current = muted
  }, [])

  const clearFinals = useCallback(() => {
    setFinals([])
  }, [])

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return {
    start,
    stop,
    mute,
    connected,
    listening,
    interim,
    finals,
    clearFinals,
    error,
  }
}
