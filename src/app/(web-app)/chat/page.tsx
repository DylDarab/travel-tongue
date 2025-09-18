'use client'

import { TopBar } from '@/app/_components/TopBar'
import { api } from '@/trpc/react'
import { ChevronDown, ChevronUp, Loader2, Mic, MicOff } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import InputSheet from './_components/InputSheet'
import { TranslationPrompt } from './_components/TranslationPrompt'
import { useSpeechRecognition } from './_hooks/useSpeechRecognition'
import { useChatFlow } from './_hooks/useChatFlow'

type Message = {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  choices?: string[]
}

type RecordingState = 'idle' | 'recording' | 'processing'

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [showInputSheet, setShowInputSheet] = useState(false)
  const [isReplyBarCollapsed, setIsReplyBarCollapsed] = useState(false)
  const [showTranslationPrompt, setShowTranslationPrompt] = useState(false)
  const [detectedJapanese, setDetectedJapanese] = useState('')
  const [translatedEnglish, setTranslatedEnglish] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Chat flow hook
  const {
    state: chatState,
    sendMessage,
    startConversationWithPhrase,
  } = useChatFlow()

  const {
    isListening,
    isProcessing,
    isSupported,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition()

  const translateText = api.conversations.translateText.useMutation<{
    translatedText: string
  }>()

  const generateReplies = api.conversations.generateReplies.useQuery(
    { conversationId: chatState.conversationId ?? '' },
    { enabled: false },
  )

  useEffect(() => {
    if (transcript && isListening) {
      setInputValue(transcript)
    }
  }, [transcript, isListening])

  useEffect(() => {
    if (!isListening && transcript && !isProcessing) {
      setDetectedJapanese(transcript)
      setShowTranslationPrompt(true)

      translateText
        .mutateAsync({
          text: transcript,
          targetLanguage: 'en',
        })
        .then((result: { translatedText: string }) => {
          setTranslatedEnglish(result.translatedText)
        })
        .catch((error: unknown) => {
          console.error('Translation error:', error)
          setTranslatedEnglish('Translation unavailable')
        })
    }
  }, [isListening, transcript, isProcessing, translateText])

  useEffect(() => {
    if (isProcessing) {
      setRecordingState('processing')
    }
  }, [isProcessing])

  useEffect(() => {
    if (speechError) {
      console.error('Speech recognition error:', speechError)
      setRecordingState('idle')
    }
  }, [speechError])

  // Handle chat flow errors
  useEffect(() => {
    if (chatState.error) {
      console.error('Chat flow error:', chatState.error)
    }
  }, [chatState.error])

  const handleSend = async () => {
    if (inputValue.trim() && chatState.conversationId) {
      const newUserMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        sender: 'user',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, newUserMessage])
      setInputValue('')
      setRecordingState('processing')
      resetTranscript()

      try {
        await sendMessage(inputValue, 'ja')
      } catch (error) {
        console.error('Failed to send message:', error)
        setRecordingState('idle')
      }
    }
  }

  const handleStartConversation = async (translatedText: string) => {
    setShowTranslationPrompt(false)

    if (chatState.conversationId) {
      // Add user message to UI immediately
      const newUserMessage: Message = {
        id: Date.now().toString(),
        text: detectedJapanese,
        sender: 'user',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, newUserMessage])

      try {
        await startConversationWithPhrase(detectedJapanese, translatedText)
      } catch (error) {
        console.error('Failed to start conversation:', error)
        setRecordingState('idle')
      }
    }
  }

  const handleDismissTranslation = () => {
    setShowTranslationPrompt(false)
    setDetectedJapanese('')
    setTranslatedEnglish('')
    resetTranscript()
    setRecordingState('idle')
  }

  const handleRecording = () => {
    if (recordingState === 'recording') {
      stopListening()
      setRecordingState('processing')
    } else {
      if (isSupported) {
        resetTranscript()
        startListening()
        setRecordingState('recording')
      } else {
        setRecordingState('recording')
        setTimeout(() => {
          setRecordingState('idle')
        }, 1500)
      }
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
    if (isListening) {
      stopListening()
      setRecordingState('idle')
    }
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
              disabled={!isSupported && recordingState !== 'recording'}
              className="min-h-[48px] min-w-[48px] rounded-full p-3 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:opacity-50"
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

      {/* Translation Prompt */}
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
