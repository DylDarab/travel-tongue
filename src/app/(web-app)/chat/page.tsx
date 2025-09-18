'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Mic,
  MicOff,
} from 'lucide-react'
import { TopBar } from '@/app/_components/TopBar'
import Button from '@/components/Button'
import InputSheet from './_components/InputSheet'
import { api } from '@/trpc/react'
import { useRouter, useSearchParams } from 'next/navigation'

type Message = {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  choices?: string[]
}

type RecordingState = 'idle' | 'recording' | 'processing'

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const scenarioId = searchParams.get('scenarioId')

  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [showInputSheet, setShowInputSheet] = useState(false)
  const [isReplyBarCollapsed, setIsReplyBarCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // tRPC hooks
  const createConversation = api.conversations.createConversation.useMutation()
  const addMessage = api.conversations.addMessage.useMutation()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const generateReplies = api.conversations.generateReplies.useQuery(
    { conversationId: conversationId ?? '' },
    { enabled: false },
  )

  // Initialize conversation when component mounts
  useEffect(() => {
    const initConversation = async () => {
      try {
        const response = await createConversation.mutateAsync({
          targetLanguage: 'ja', // Get from user profile or default
          scenarioId: scenarioId ?? undefined,
        })

        setConversationId(response.id)
        setMessages([])
      } catch (error) {
        console.error('Failed to create conversation:', error)
      }
    }

    void initConversation()
  }, [createConversation, scenarioId])

  const handleSend = () => {
    if (inputValue.trim() && conversationId) {
      // Add user message to UI immediately
      const newUserMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        sender: 'user',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, newUserMessage])
      setInputValue('')
      setRecordingState('processing')

      // Send message to backend
      addMessage.mutate(
        {
          conversationId,
          text: inputValue,
          isUserMessage: true,
          language: 'en', // Get from user profile
        },
        {
          onSuccess: (message) => {
            // Get 6 reply options
            void generateReplies.refetch()
          },
          onError: (error) => {
            console.error('Failed to send message:', error)
            setRecordingState('idle')
          },
        },
      )
    }
  }

  const handleRecording = () => {
    if (recordingState === 'recording') {
      setRecordingState('processing')
      // TODO: Implement speech recognition
      // For now, we'll just simulate processing
      setTimeout(() => {
        setRecordingState('idle')
      }, 1500)
    } else {
      setRecordingState('recording')
    }
  }

  const handleReplyChipClick = (reply: string) => {
    setInputValue(reply)
    setShowInputSheet(true)
  }

  // Handle reply generation
  useEffect(() => {
    if (generateReplies.data) {
      // Update the last user message with reply options
      setMessages((prev) => {
        if (prev.length === 0) return prev
        const lastMessage: Message = { ...prev[prev.length - 1] } as Message
        lastMessage.choices = generateReplies.data
        return [...prev.slice(0, -1), lastMessage]
      })
      setRecordingState('idle')
    }
  }, [generateReplies.data])

  const handleTypeOwnClick = () => {
    setShowInputSheet(true)
    setInputValue('')
  }

  const handleCloseInputSheet = () => {
    setShowInputSheet(false)
    setInputValue('')
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <TopBar
        title="Live Conversation"
        description=""
        backButton={true}
        menuItems={
          <>
            <button
              onClick={handleRecording}
              className="min-h-[48px] min-w-[48px] rounded-full p-3 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              aria-label={
                recordingState === 'idle'
                  ? 'Start recording'
                  : recordingState === 'recording'
                    ? 'Stop recording'
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
          </>
        }
      />
      {/* Transcript Panel */}
      {/* Transcript Panel */}
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
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Chips */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3">
          {!isReplyBarCollapsed &&
            messages.length > 0 &&
            messages[messages.length - 1]?.choices
              ?.slice(0, 6)
              .map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleReplyChipClick(reply)}
                  className="w-full rounded-xl border border-teal-500 bg-white px-4 py-3 text-left text-base text-teal-700 transition-colors hover:bg-teal-50 focus:bg-teal-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {reply}
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

      {/* Input Sheet */}
      {showInputSheet && (
        <InputSheet
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSend}
          recordingState={recordingState}
          onRecording={handleRecording}
          onClose={handleCloseInputSheet}
          replyOptions={
            messages.length > 0
              ? (messages[messages.length - 1]?.choices ?? [])
              : []
          }
        />
      )}
    </div>
  )
}
