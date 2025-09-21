'use client'

import { Mic, MicOff, Loader2, Send, X } from 'lucide-react'
import TextInput from '@/components/TextInput'

interface InputSheetProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  recordingState: 'idle' | 'recording' | 'processing'
  onRecording: () => void
  onClose: () => void
  replyOptions?: string[]
}

export default function InputSheet({
  value,
  onChange,
  onSubmit,
  recordingState,
  onRecording,
  onClose,
  replyOptions = [],
}: InputSheetProps) {
  return (
    <div className="fixed right-0 bottom-0 left-0 border-t border-gray-200 bg-white p-4">
      {/* Reply options */}
      {replyOptions.length > 0 && (
        <div className="mb-3 space-y-2">
          {replyOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                onChange(option)
              }}
              className="w-full rounded-lg bg-gray-50 p-2 text-left hover:bg-gray-100"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <TextInput
            label="Message"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your message..."
            onSubmit={onSubmit}
          />
        </div>
        <button
          onClick={onRecording}
          className={`rounded-full p-2 ${
            recordingState === 'recording'
              ? 'animate-pulse text-red-500'
              : 'text-teal-500'
          }`}
          aria-label={
            recordingState === 'recording'
              ? 'Stop recording'
              : 'Start recording'
          }
          disabled={recordingState === 'processing'}
        >
          {recordingState === 'processing' ? (
            <Loader2 className="animate-spin" size={24} />
          ) : recordingState === 'recording' ? (
            <MicOff size={24} />
          ) : (
            <Mic size={24} />
          )}
        </button>
        {value && (
          <button
            onClick={onSubmit}
            className="p-2 text-teal-500"
            aria-label="Send"
          >
            <Send size={24} />
          </button>
        )}
        <button
          onClick={onClose}
          className="p-2 text-gray-500"
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  )
}
