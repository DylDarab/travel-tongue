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

type Message = {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

type RecordingState = 'idle' | 'recording' | 'processing'

const mockTranscript: Message[] = [
  {
    id: '1',
    text: 'Hello! How do I ask for directions to the train station?',
    sender: 'user',
    timestamp: new Date(2025, 8, 17, 12, 30),
  },
  {
    id: '2',
    text: 'Excuse me, where is the train station?',
    sender: 'ai',
    timestamp: new Date(2025, 8, 17, 12, 30, 5),
  },
  {
    id: '3',
    text: 'Could you please show me the way to the train station?',
    sender: 'ai',
    timestamp: new Date(2025, 8, 17, 12, 30, 10),
  },
]

const mockReplies = [
  'Where is the train station?',
  'Can you help me find the train station?',
  'How do I get to the train station?',
  'Is the train station near here?',
  'Which way to the train station?',
  'Train station directions please',
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(mockTranscript)
  const [inputValue, setInputValue] = useState('')
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [showInputSheet, setShowInputSheet] = useState(false)
  const [isReplyBarCollapsed, setIsReplyBarCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSend = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        sender: 'user',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, newMessage])
      setInputValue('')
      setRecordingState('processing')

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text:
            mockReplies[Math.floor(Math.random() * mockReplies.length)] ??
            'How can I help?',
          sender: 'ai',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiResponse])
        setRecordingState('idle')
      }, 1000)
    }
  }

  const handleRecording = () => {
    if (recordingState === 'recording') {
      setRecordingState('processing')
      // Simulate processing
      setTimeout(() => {
        setRecordingState('idle')
        // Simulate AI response
        const aiResponse: Message = {
          id: Date.now().toString(),
          text:
            mockReplies[Math.floor(Math.random() * mockReplies.length)] ??
            'How can I help?',
          sender: 'ai',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiResponse])
      }, 1500)
    } else {
      setRecordingState('recording')
    }
  }

  const handleReplyChipClick = (reply: string) => {
    setInputValue(reply)
    setShowInputSheet(true)
  }

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
            mockReplies.slice(0, 6).map((reply, index) => (
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
        />
      )}
    </div>
  )
}
