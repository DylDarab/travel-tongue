'use client'

import {
  use,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { ChevronDown, ChevronUp, Loader2, Mic, MicOff } from 'lucide-react'
import { TopBar } from '@/app/_components/TopBar'
import { api } from '@/trpc/react'
import InputSheet from '../_components/InputSheet'
import { TranslationPrompt } from '../_components/TranslationPrompt'
import { useDeepgramLive } from '@/hooks/useDeepgramLive'
import { nextState, type Events, type TurnState } from '@/lib/turnMachine'

type Message = {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  choices?: Array<{
    id: string
    label: string
    localAnswer: string
    targetAnswer: string
  }>
}

type RecordingState = 'idle' | 'recording' | 'processing'

interface PageProps {
  params: Promise<{ id: string }>
}

const SILENCE_TIMEOUT_MS = 1200

const SPEECH_LANG_MAP: Record<string, string> = {
  ja: 'ja-JP',
  'ja-jp': 'ja-JP',
  en: 'en-US',
  'en-us': 'en-US',
}

function resolveSpeechLang(lang?: string) {
  if (!lang) return 'ja-JP'
  const key = lang.toLowerCase()
  return SPEECH_LANG_MAP[key] ?? `${key}-${key.toUpperCase()}`
}

function speakText(text: string, lang: string) {
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

export default function ChatPage({ params }: PageProps) {
  const { id: conversationId } = use(params)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [showInputSheet, setShowInputSheet] = useState(false)
  const [isReplyBarCollapsed, setIsReplyBarCollapsed] = useState(false)
  const [showTranslationPrompt, setShowTranslationPrompt] = useState(false)
  const [detectedJapanese, setDetectedJapanese] = useState('')
  const [translatedEnglish, setTranslatedEnglish] = useState('')
  const [turnState, dispatchTurn] = useReducer(
    (state: TurnState, event: Events) => nextState(state, event),
    'idle',
  )

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastProcessedFinalRef = useRef<{ text: string; turn: number } | null>(
    null,
  )
  const handlingFinalRef = useRef(false)
  const turnCounterRef = useRef(0)
  const pendingFinalRef = useRef<string | null>(null)

  const {
    data: conversation,
    isLoading: isLoadingConversation,
    refetch: refetchConversation,
  } = api.conversations.getConversation.useQuery(
    { id: conversationId },
    { enabled: !!conversationId },
  )

  const addMessage = api.conversations.addMessage.useMutation()
  const generateReplies = api.conversations.generateReplies.useMutation()
  const translateText = api.conversations.translateText.useMutation()

  const {
    start,
    stop,
    mute,
    listening,
    interim,
    finals,
    clearFinals,
    error: deepgramError,
  } = useDeepgramLive({ language: conversation?.targetLanguage ?? 'ja' })

  const recordingState: RecordingState = useMemo(() => {
    if (turnState === 'speaking_user') return 'processing'
    if (listening && turnState === 'listening_local') return 'recording'
    return 'idle'
  }, [listening, turnState])

  const latestChoices = useMemo(
    () => messages[messages.length - 1]?.choices ?? [],
    [messages],
  )

  useEffect(() => {
    if (conversation?.messages) {
      const conversationMessages: Message[] = conversation.messages.map(
        (msg) => ({
          id: msg.id,
          text: msg.text,
          sender: msg.isUserMessage ? 'user' : 'ai',
          timestamp: msg.timestamp,
          choices: msg.choices as
            | Array<{
                id: string
                label: string
                localAnswer: string
                targetAnswer: string
              }>
            | undefined,
        }),
      )
      setMessages(conversationMessages)
    }
  }, [conversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, interim])

  useEffect(() => {
    if (!deepgramError) return
    console.error('Deepgram error:', deepgramError)
    dispatchTurn({ type: 'ERROR' })
  }, [deepgramError])

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }
  }, [])

  const scheduleSilenceTimer = useCallback(() => {
    clearSilenceTimer()
    silenceTimeoutRef.current = setTimeout(() => {
      silenceTimeoutRef.current = null
      stop()
      dispatchTurn({ type: 'SILENCE_TIMEOUT' })
      dispatchTurn({ type: 'RESET' })
    }, SILENCE_TIMEOUT_MS)
  }, [clearSilenceTimer, stop])

  const handleDeepgramFinal = useCallback(
    async (text: string) => {
      const transcript = text.trim()
      clearSilenceTimer()
      stop()

      if (!transcript) {
        dispatchTurn({ type: 'SILENCE_TIMEOUT' })
        dispatchTurn({ type: 'RESET' })
        return
      }

      dispatchTurn({ type: 'DG_FINAL', text: transcript })

      const localMessage: Message = {
        id: crypto.randomUUID(),
        text: transcript,
        sender: 'ai',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, localMessage])
      setDetectedJapanese(transcript)
      setTranslatedEnglish('Translating…')
      setShowTranslationPrompt(true)

      try {
        const translation = await translateText.mutateAsync({
          text: transcript,
          targetLanguage: 'en',
        })
        setTranslatedEnglish(translation.translatedText)
      } catch (error) {
        console.error('Translation error:', error)
        setTranslatedEnglish('Translation unavailable')
      }

      if (conversationId) {
        try {
          await addMessage.mutateAsync({
            conversationId,
            text: transcript,
            isUserMessage: false,
            language: conversation?.targetLanguage ?? 'ja',
          })
          const replies = await generateReplies.mutateAsync({ conversationId })
          setMessages((prev) => {
            if (!prev.length) return prev
            const updated = [...prev]
            const lastIndex = updated.length - 1
            updated[lastIndex] = { ...updated[lastIndex], choices: replies }
            return updated
          })
          void refetchConversation()
        } catch (error) {
          console.error('Failed to process local reply:', error)
          dispatchTurn({ type: 'ERROR' })
          return
        }
      }

      dispatchTurn({ type: 'RESET' })
    },
    [
      addMessage,
      clearSilenceTimer,
      conversation?.targetLanguage,
      conversationId,
      generateReplies,
      refetchConversation,
      stop,
      translateText,
    ],
  )

  useEffect(() => {
    if (!finals.length) return

    const latest = finals[finals.length - 1]?.trim()
    if (!latest) {
      clearFinals()
      return
    }

    const currentTurn = turnCounterRef.current

    const alreadyHandled =
      lastProcessedFinalRef.current?.turn === currentTurn &&
      lastProcessedFinalRef.current?.text === latest

    if (alreadyHandled) {
      clearFinals()
      return
    }

    if (handlingFinalRef.current) {
      pendingFinalRef.current = latest
      return
    }

    handlingFinalRef.current = true
    pendingFinalRef.current = null

    void (async () => {
      try {
        await handleDeepgramFinal(latest)
        lastProcessedFinalRef.current = { text: latest, turn: currentTurn }
      } finally {
        const pending = pendingFinalRef.current
        pendingFinalRef.current = null

        if (
          pending &&
          !(
            lastProcessedFinalRef.current?.turn === currentTurn &&
            lastProcessedFinalRef.current?.text === pending
          )
        ) {
          try {
            await handleDeepgramFinal(pending)
            lastProcessedFinalRef.current = { text: pending, turn: currentTurn }
          } catch (error) {
            console.error('Failed to process pending final', error)
          }
        }

        handlingFinalRef.current = false
        clearFinals()
      }
    })()
  }, [finals, clearFinals, handleDeepgramFinal])

  useEffect(() => {
    if (turnState === 'listening_local') {
      scheduleSilenceTimer()
      return clearSilenceTimer
    }

    clearSilenceTimer()
  }, [turnState, scheduleSilenceTimer, clearSilenceTimer])

  useEffect(() => {
    if (turnState !== 'listening_local') return
    if (!interim) return
    scheduleSilenceTimer()
  }, [turnState, interim, scheduleSilenceTimer])

  const handleUserUtterance = useCallback(
    async (rawText: string) => {
      const text = rawText.trim()
      if (!text || !conversationId) return

      const targetLang = resolveSpeechLang(
        conversation?.targetLanguage ?? 'ja-JP',
      )

      dispatchTurn({ type: 'TTS_START' })
      mute(true)
      pendingFinalRef.current = null
      clearFinals()

      try {
        await start()
        turnCounterRef.current += 1
        lastProcessedFinalRef.current = null
        handlingFinalRef.current = false
        pendingFinalRef.current = null
        clearFinals()
      } catch (error) {
        console.error('Failed to start Deepgram capture:', error)
        dispatchTurn({ type: 'ERROR' })
        mute(false)
        stop()
        return
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        text,
        sender: 'user',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue('')
      setShowInputSheet(false)

      await speakText(text, targetLang)
      mute(false)
      dispatchTurn({ type: 'TTS_END' })

      try {
        await addMessage.mutateAsync({
          conversationId,
          text,
          isUserMessage: true,
          language: conversation?.targetLanguage ?? 'ja',
        })
        void refetchConversation()
      } catch (error) {
        console.error('Failed to record user message:', error)
      }
    },
    [
      addMessage,
      clearFinals,
      conversation?.targetLanguage,
      conversationId,
      mute,
      refetchConversation,
      start,
      stop,
    ],
  )

  const handleReplyChipClick = useCallback(
    (reply: {
      id: string
      label: string
      localAnswer: string
      targetAnswer: string
    }) => {
      void handleUserUtterance(reply.targetAnswer)
    },
    [handleUserUtterance],
  )

  const handleSend = useCallback(async () => {
    await handleUserUtterance(inputValue)
  }, [handleUserUtterance, inputValue])

  const handleTypeOwnClick = () => {
    setShowInputSheet(true)
  }

  const handleCloseInputSheet = () => {
    setShowInputSheet(false)
    setInputValue('')
  }

  const handleStartConversation = async (_translatedText: string) => {
    setShowTranslationPrompt(false)
  }

  const handleDismissTranslation = () => {
    setShowTranslationPrompt(false)
    setDetectedJapanese('')
    setTranslatedEnglish('')
  }

  const handleRecording = async () => {
    if (turnState === 'speaking_user') return

    if (listening) {
      stop()
      dispatchTurn({ type: 'RESET' })
    } else {
      dispatchTurn({ type: 'TTS_START' })
      dispatchTurn({ type: 'TTS_END' })
      mute(false)
      pendingFinalRef.current = null
      try {
        await start()
        turnCounterRef.current += 1
        lastProcessedFinalRef.current = null
        handlingFinalRef.current = false
        pendingFinalRef.current = null
        clearFinals()
      } catch (error) {
        console.error('Failed to start listening:', error)
        dispatchTurn({ type: 'ERROR' })
      }
    }
  }

  if (isLoadingConversation) {
    return (
      <div className="flex h-screen flex-col bg-gray-50">
        <TopBar title="Loading..." description="" backButton={true} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-gray-500">Loading conversation...</div>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex h-screen flex-col bg-gray-50">
        <TopBar
          title="Conversation not found"
          description=""
          backButton={true}
        />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-gray-500">Conversation not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <TopBar
        title="Live Conversation"
        description={
          interim && turnState === 'listening_local' ? 'Listening…' : ''
        }
        backButton={true}
        menuItems={
          <button
            onClick={handleRecording}
            disabled={turnState === 'speaking_user'}
            className="min-h-[48px] min-w-[48px] rounded-full p-3 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:opacity-50"
            aria-label={
              recordingState === 'idle'
                ? 'Start listening'
                : recordingState === 'recording'
                  ? 'Stop listening'
                  : 'Processing'
            }
          >
            {recordingState === 'processing' ? (
              <Loader2 className="animate-spin text-gray-600" size={20} />
            ) : recordingState === 'recording' ? (
              <MicOff className="text-red-500" size={20} />
            ) : (
              <Mic className="text-gray-600" size={20} />
            )}
          </button>
        }
      />
      <div className="flex-1 space-y-4 overflow-y-auto p-4 pt-20">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl p-4 ${
                message.sender === 'user'
                  ? 'bg-teal-500 text-white'
                  : 'border border-gray-200 bg-white'
              }`}
            >
              <p>{message.text}</p>
              <span
                className={`mt-1 block text-xs ${
                  message.sender === 'user' ? 'text-teal-100' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {turnState === 'listening_local' && interim && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-2xl border border-dashed border-teal-400 bg-white/70 p-4 text-teal-700">
              <p className="italic">{interim}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3">
          {!isReplyBarCollapsed &&
            latestChoices.slice(0, 6).map((reply) => (
              <button
                key={reply.id}
                onClick={() => handleReplyChipClick(reply)}
                className="w-full rounded-xl border border-teal-500 bg-white px-4 py-3 text-left text-base text-teal-700 transition-colors hover:bg-teal-50 focus:bg-teal-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {reply.label}
              </button>
            ))}
          <button
            onClick={() => setIsReplyBarCollapsed(!isReplyBarCollapsed)}
            className="flex w-full items-center justify-between rounded-xl border border-teal-500 bg-white px-4 py-3 text-left text-base text-teal-700 transition-colors hover:bg-teal-50 focus:bg-teal-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <span>{isReplyBarCollapsed ? 'Show replies' : 'Hide replies'}</span>
            {isReplyBarCollapsed ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronUp size={20} />
            )}
          </button>
          <button
            onClick={handleTypeOwnClick}
            className="w-full rounded-xl border border-teal-500 bg-white px-4 py-3 text-left text-base text-teal-700 transition-colors hover:bg-teal-50 focus:bg-teal-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            Type your own
          </button>
        </div>
      </div>

      {showTranslationPrompt && (
        <TranslationPrompt
          detectedJapanese={detectedJapanese}
          translatedEnglish={translatedEnglish}
          onDismiss={handleDismissTranslation}
          onStartConversation={handleStartConversation}
        />
      )}

      {showInputSheet && (
        <InputSheet
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSend}
          recordingState={recordingState}
          onRecording={() => void handleSend()}
          onClose={handleCloseInputSheet}
          replyOptions={latestChoices.map((choice) => choice.label)}
        />
      )}
    </div>
  )
}
