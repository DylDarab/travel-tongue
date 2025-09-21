import type { Message } from '../../_types'
import clsx from 'clsx'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={clsx('flex', {
        'justify-end': message.sender === 'user',
        'justify-start': message.sender !== 'user',
      })}
    >
      <div
        className={clsx('max-w-[70%] rounded-2xl p-4', {
          'bg-teal-500 text-white': message.sender === 'user',
          'border border-gray-200 bg-white': message.sender !== 'user',
        })}
      >
        <p>{message.text}</p>
        {message.sender !== 'user' && message.translation && (
          <p className="mt-2 text-sm text-teal-600">{message.translation}</p>
        )}
        <span
          className={clsx('mt-1 block text-xs', {
            'text-teal-100': message.sender === 'user',
            'text-gray-500': message.sender !== 'user',
          })}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  )
}
