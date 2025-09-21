'use client'

import { useDeepgramLive } from '@/hooks/useDeepgramLive'
import { api } from '@/trpc/react'
import Button from '@/components/Button'
import { MessageBubble } from './_components/MessageBubble'
import clsx from 'clsx'
import { Loader2, Mic } from 'lucide-react'
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { resolveSpeechLang, speakText } from './_hooks'
import { type Message, type PageProps } from './_types'

type ReplyChoice = {
  id: string
  label: string
  localAnswer: string
  targetAnswer: string
}

export default function ChatPage({ params }: PageProps) {
  const { id: conversationId } = use(params)
  const [replyChoices, setReplyChoices] = useState<ReplyChoice[]>([])
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pendingFinalsRef = useRef<string[]>([])
  const processingFinalRef = useRef(false)
  const replyRequestIdRef = useRef(0)
  const lastConversationIdRef = useRef<string | null>(null)

  const utils = api.useUtils()

  const { data: conversation, isLoading: isLoadingConversation } =
    api.conversations.getConversation.useQuery(
      { id: conversationId },
      { enabled: !!conversationId },
    )

  const { data: userProfile } = api.users.getUserProfile.useQuery()

  const preferredLanguage = useMemo(
    () => userProfile?.preferredLanguage ?? 'en',
    [userProfile?.preferredLanguage],
  )

  const translateTextMutation = api.conversations.translateText.useMutation()
  const addMessageMutation = api.conversations.addMessage.useMutation()
  const generateRepliesMutation =
    api.conversations.generateReplies.useMutation()
  const generateReplies = generateRepliesMutation.mutateAsync

  const {
    start,
    stop,
    mute,
    listening,
    interim,
    finals,
    clearFinals,
    error: deepgramError,
    connected,
  } = useDeepgramLive({ language: conversation?.targetLanguage ?? 'ja' })

  const appendMessageToCache = useCallback(
    (message: {
      id: string
      text: string
      translatedText: string
      isUserMessage: boolean
      language: string | null
      createdAt: Date
    }) => {
      if (!conversationId) return

      utils.conversations.getConversation.setData(
        { id: conversationId },
        (previous) => {
          if (!previous) return previous

          if (
            previous.messages.some((existing) => existing.id === message.id)
          ) {
            return previous
          }

          const normalized = {
            id: message.id,
            text: message.text,
            translatedText: message.translatedText,
            isUserMessage: message.isUserMessage,
            language: message.language,
            timestamp: message.createdAt,
            choices: message.isUserMessage ? [] : undefined,
            selectedChoice: undefined,
          }

          return {
            ...previous,
            messages: [...previous.messages, normalized],
          }
        },
      )
    },
    [conversationId, utils],
  )

  const handleTranscript = useCallback(
    async (rawText: string) => {
      const transcript = rawText.trim()
      if (!transcript || !conversationId) return

      let translatedText = transcript

      if (preferredLanguage) {
        try {
          const translation = await translateTextMutation.mutateAsync({
            text: transcript,
            targetLanguage: preferredLanguage,
          })
          translatedText = translation.translatedText
        } catch (error) {
          console.error('Translation error:', error)
          translatedText = transcript
        }
      }

      try {
        const newMessage = await addMessageMutation.mutateAsync({
          conversationId,
          text: transcript,
          isUserMessage: false,
          language: conversation?.targetLanguage ?? 'ja',
          translatedText,
        })
        appendMessageToCache(newMessage)
      } catch (error) {
        console.error('Failed to store transcript:', error)
      }
    },
    [
      addMessageMutation,
      appendMessageToCache,
      conversation?.targetLanguage,
      conversationId,
      preferredLanguage,
      translateTextMutation,
    ],
  )

  const processPendingFinals = useCallback(() => {
    if (processingFinalRef.current) return

    const next = pendingFinalsRef.current.shift()
    if (!next) return

    processingFinalRef.current = true
    setIsProcessingTranscript(true)

    void (async () => {
      try {
        await handleTranscript(next)
      } finally {
        processingFinalRef.current = false
        setIsProcessingTranscript(false)
        setTimeout(processPendingFinals, 0)
      }
    })()
  }, [handleTranscript])

  useEffect(() => {
    if (!finals.length) return

    const cleaned = finals.map((value) => value.trim()).filter(Boolean)
    clearFinals()

    if (!cleaned.length) return

    pendingFinalsRef.current.push(...cleaned)
    processPendingFinals()
  }, [finals, clearFinals, processPendingFinals])

  useEffect(() => {
    if (!conversationId) return

    void start()

    return () => {
      stop()
    }
  }, [conversation?.targetLanguage, conversationId, start, stop])

  const messageCount = conversation?.messages.length ?? 0

  useEffect(() => {
    if (!conversationId) return

    if (lastConversationIdRef.current !== conversationId) {
      lastConversationIdRef.current = conversationId
      replyRequestIdRef.current = 0
    }

    if (messageCount === 0) {
      setReplyChoices((previous) => (previous.length ? [] : previous))
      return
    }

    replyRequestIdRef.current += 1
    const requestId = replyRequestIdRef.current

    void (async () => {
      try {
        const replies = await generateReplies({
          conversationId,
        })

        if (replyRequestIdRef.current === requestId) {
          setReplyChoices(replies)
        }
      } catch (error) {
        console.error('Failed to generate reply options:', error)
      }
    })()
  }, [conversationId, generateReplies, messageCount])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages, interim])

  useEffect(() => {
    if (!deepgramError) return
    console.error('Deepgram error:', deepgramError)
  }, [deepgramError])

  const handleUserUtterance = useCallback(
    async (targetText: string, localTranslation?: string) => {
      const text = targetText.trim()
      if (!text || !conversationId) return

      const languageCode = resolveSpeechLang(
        conversation?.targetLanguage ?? 'ja-JP',
      )

      pendingFinalsRef.current = []
      clearFinals()

      try {
        mute(true)
        await speakText(text, languageCode)
      } catch (error) {
        console.error('Speech synthesis failed:', error)
      } finally {
        mute(false)
      }

      try {
        const newMessage = await addMessageMutation.mutateAsync({
          conversationId,
          text,
          isUserMessage: true,
          language: conversation?.targetLanguage ?? 'ja',
          translatedText: localTranslation ?? text,
        })
        appendMessageToCache(newMessage)
      } catch (error) {
        console.error('Failed to store user message:', error)
      }
    },
    [
      addMessageMutation,
      appendMessageToCache,
      clearFinals,
      conversation?.targetLanguage,
      conversationId,
      mute,
    ],
  )

  const handleReplyChipClick = useCallback(
    (reply: ReplyChoice) => {
      void handleUserUtterance(reply.targetAnswer, reply.localAnswer)
      setReplyChoices([])
    },
    [handleUserUtterance],
  )

  const handleRespeak = useCallback(
    async (message: Message) => {
      const textToSpeak = message.text.trim()
      if (!textToSpeak) return

      const languageCode = resolveSpeechLang(
        message.language ?? conversation?.targetLanguage ?? 'ja-JP',
      )

      pendingFinalsRef.current = []
      clearFinals()

      try {
        mute(true)
        await speakText(textToSpeak, languageCode)
      } catch (error) {
        console.error('Speech synthesis failed:', error)
      } finally {
        mute(false)
      }
    },
    [clearFinals, conversation?.targetLanguage, mute],
  )

  const messages = useMemo<Message[]>(() => {
    if (!conversation?.messages) return []

    return conversation.messages.map((msg) => ({
      id: msg.id,
      text: msg.text,
      sender: msg.isUserMessage ? ('user' as const) : ('ai' as const),
      timestamp: new Date(msg.timestamp),
      translation:
        msg.translatedText && msg.translatedText.trim().length > 0
          ? msg.translatedText
          : undefined,
      language: msg.language ?? undefined,
    }))
  }, [conversation?.messages])

  const isBusy =
    isProcessingTranscript ||
    addMessageMutation.isPending ||
    translateTextMutation.isPending ||
    generateRepliesMutation.isPending

  const statusText = useMemo(() => {
    if (deepgramError) return 'Microphone error'
    if (isBusy) return 'Processing…'
    if (!connected) return 'Connecting microphone…'
    if (listening) return 'Recording…'
    return 'Ready'
  }, [connected, deepgramError, isBusy, listening])

  if (isLoadingConversation) {
    return (
      <div className="flex h-screen flex-col bg-gray-50">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-gray-500">Loading conversation...</div>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex h-screen flex-col bg-gray-50">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-gray-500">Conversation not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-medium text-gray-900">
              Live Conversation
            </h1>
            {statusText && (
              <p className="mt-1 text-sm text-gray-500">{statusText}</p>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700">
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mic
                className={clsx(
                  'h-4 w-4',
                  listening ? 'text-teal-600' : 'text-gray-400',
                )}
              />
            )}
            <span>{listening ? 'Recording' : 'Idle'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onRespeak={handleRespeak}
          />
        ))}

        {interim && (
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
          {replyChoices.map((reply) => (
            <Button
              key={reply.id}
              label={reply.label}
              variant="outline"
              fullWidth
              disabled={addMessageMutation.isPending}
              onClick={() => handleReplyChipClick(reply)}
            />
          ))}

          {generateRepliesMutation.isPending && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating reply suggestions…</span>
            </div>
          )}

          {!generateRepliesMutation.isPending && replyChoices.length === 0 && (
            <div className="rounded-lg border border-dashed border-teal-200 p-4 text-center text-sm text-teal-700">
              Suggested replies will appear here once available.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
