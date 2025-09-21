'use client'

import { TopBar } from '@/app/_components/TopBar'
import { useDeepgramLive } from '@/hooks/useDeepgramLive'
import { nextState } from '@/lib/turnMachine'
import { api } from '@/trpc/react'
import { ChevronDown, ChevronUp, Loader2, Mic, MicOff } from 'lucide-react'
import {
  use,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import InputSheet from '../_components/InputSheet'
import Button from '@/components/Button'
import { MessageBubble } from './_components/MessageBubble'
import clsx from 'clsx'
import { SILENCE_TIMEOUT_MS } from './_constants'
import { resolveSpeechLang, speakText } from './_hooks'
import {
  type Events,
  type PageProps,
  type RecordingState,
  type TurnState,
} from './_types'

export default function ChatPage({ params }: PageProps) {
  const { id: conversationId } = use(params)
  const [inputValue, setInputValue] = useState('')
  const [showInputSheet, setShowInputSheet] = useState(false)
  const [isReplyBarCollapsed, setIsReplyBarCollapsed] = useState(false)
  const [latestChoices, setLatestChoices] = useState<Array<{
    id: string
    label: string
    localAnswer: string
    targetAnswer: string
  }> | null>(null)
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
  const manualPauseRef = useRef(false)

  const {
    data: conversation,
    isLoading: isLoadingConversation,
    refetch: refetchConversation,
  } = api.conversations.getConversation.useQuery(
    { id: conversationId },
    { enabled: !!conversationId },
  )

  const { data: userProfile } = api.users.getUserProfile.useQuery()

  const preferredLanguage = useMemo(
    () => userProfile?.preferredLanguage ?? 'en',
    [userProfile?.preferredLanguage],
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

  const statusText = useMemo(() => {
    if (turnState === 'speaking_user') return 'Playing response…'
    if (turnState === 'processing_llm' || recordingState === 'processing') {
      return 'Processing…'
    }
    if (turnState === 'listening_local' || recordingState === 'recording') {
      return 'Recording…'
    }
    return ''
  }, [recordingState, turnState])

  const messages = useMemo(() => {
    if (!conversation?.messages) return []

    return conversation.messages.map((msg) => ({
      id: msg.id,
      text: msg.text,
      sender: msg.isUserMessage ? ('user' as const) : ('ai' as const),
      timestamp: msg.timestamp,
      translation:
        msg.translatedText && msg.translatedText.trim().length > 0
          ? msg.translatedText
          : undefined,
      choices: undefined,
    }))
  }, [conversation?.messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages, interim])

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

  const beginListening = useCallback(async () => {
    if (turnState === 'speaking_user' || listening) return

    manualPauseRef.current = false
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
      manualPauseRef.current = true
      dispatchTurn({ type: 'ERROR' })
    }
  }, [clearFinals, listening, mute, start, turnState])

  const haltListening = useCallback(() => {
    manualPauseRef.current = true
    clearSilenceTimer()
    stop()
    dispatchTurn({ type: 'RESET' })
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

      let translatedText = ''

      if (preferredLanguage) {
        try {
          const result = await translateText.mutateAsync({
            text: transcript,
            targetLanguage: preferredLanguage,
          })
          translatedText = result.translatedText
        } catch (error) {
          console.error('Translation error:', error)
          translatedText = 'Translation unavailable'
        }
      }

      if (conversationId) {
        try {
          await addMessage.mutateAsync({
            conversationId,
            text: transcript,
            isUserMessage: false,
            language: conversation?.targetLanguage ?? 'ja',
            translatedText: translatedText,
          })

          const replies = await generateReplies.mutateAsync({
            conversationId,
          })

          if (replies && replies.length > 0) {
            setLatestChoices(replies)
          }

          void refetchConversation()
        } catch (error) {
          console.error('Failed to process local reply:', error)
          dispatchTurn({ type: 'ERROR' })
          return
        }
      }

      manualPauseRef.current = false
      dispatchTurn({ type: 'RESET' })
    },
    [
      addMessage,
      clearSilenceTimer,
      conversation?.targetLanguage,
      conversationId,
      generateReplies,
      preferredLanguage,
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

  useEffect(() => {
    if (!conversationId) return
    if (isLoadingConversation) return
    if (manualPauseRef.current) return
    if (listening) return
    if (turnState !== 'idle') return

    void beginListening()
  }, [
    beginListening,
    conversationId,
    isLoadingConversation,
    listening,
    turnState,
  ])

  const handleUserUtterance = useCallback(
    async (rawText: string, translatedText?: string) => {
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
          translatedText: translatedText ?? text,
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
      void handleUserUtterance(reply.targetAnswer, reply.localAnswer)
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

  const handleRecording = useCallback(async () => {
    if (turnState === 'speaking_user') return

    if (listening) {
      haltListening()
    } else {
      await beginListening()
    }
  }, [beginListening, haltListening, listening, turnState])

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
        description={statusText}
        backButton={true}
        menuItems={
          <button
            onClick={handleRecording}
            disabled={turnState === 'speaking_user'}
            className={clsx(
              'min-h-[48px] min-w-[48px] rounded-full p-3 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-teal-500 focus:outline-none',
              turnState === 'speaking_user' && 'opacity-50',
            )}
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
          <MessageBubble key={message.id} message={message} />
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
            latestChoices
              ?.slice(0, 6)
              .map((reply) => (
                <Button
                  key={reply.id}
                  label={reply.label}
                  variant="outline"
                  fullWidth
                  onClick={() => handleReplyChipClick(reply)}
                />
              ))}
          <Button
            label={isReplyBarCollapsed ? 'Show replies' : 'Hide replies'}
            variant="outline"
            fullWidth
            rightIcon={
              isReplyBarCollapsed ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronUp size={20} />
              )
            }
            onClick={() => setIsReplyBarCollapsed(!isReplyBarCollapsed)}
          />
          <Button
            label="Type your own"
            variant="outline"
            fullWidth
            onClick={handleTypeOwnClick}
          />
        </div>
      </div>
      {showInputSheet && (
        <InputSheet
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSend}
          recordingState={recordingState}
          onRecording={() => void handleSend()}
          onClose={handleCloseInputSheet}
          replyOptions={
            latestChoices ? latestChoices.map((choice) => choice.label) : []
          }
        />
      )}
    </div>
  )
}
