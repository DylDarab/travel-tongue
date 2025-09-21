import { Volume2 } from 'lucide-react'
import clsx from 'clsx'
import type { Message } from '../../_types'

interface MessageBubbleProps {
  message: Message
  onRespeak?: (message: Message) => void
}

export function MessageBubble({ message, onRespeak }: MessageBubbleProps) {
  const isUserMessage = message.sender === 'user'
  const displayText =
    isUserMessage && message.translation
      ? message.translation
      : message.text
  const showRespeakButton = isUserMessage && typeof onRespeak === 'function'

  return (
    <div
      className={clsx('flex', {
        'justify-end': isUserMessage,
        'justify-start': !isUserMessage,
      })}
    >
      <div
        className={clsx('max-w-[70%] rounded-2xl p-4', {
          'bg-teal-500 text-white': isUserMessage,
          'border border-gray-200 bg-white': !isUserMessage,
        })}
      >
        <div className="flex items-start gap-3">
          <p className="flex-1 whitespace-pre-wrap break-words">
            {displayText}
          </p>
          {showRespeakButton && (
            <button
              type="button"
              onClick={() => onRespeak?.(message)}
              className={clsx(
                'rounded-full p-2 transition-colors focus:outline-none focus:ring-2',
                isUserMessage
                  ? 'text-white hover:bg-white/20 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-teal-500'
                  : 'text-teal-600 hover:bg-teal-100 focus:ring-teal-200',
              )}
              aria-label="Replay pronunciation"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          )}
        </div>
        {!isUserMessage && message.translation && (
          <p className="mt-2 text-sm text-teal-600">{message.translation}</p>
        )}
        <span
          className={clsx('mt-1 block text-xs', {
            'text-teal-100': isUserMessage,
            'text-gray-500': !isUserMessage,
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
