import { TopBar } from '@/app/_components/TopBar'
import Button from '@/components/Button'
import { Clock, MessageCircle } from 'lucide-react'
import { api } from '@/trpc/server'
import Link from 'next/link'

export default async function HistoryPage() {
  let history
  try {
    history = await api.conversations.getHistory({ limit: 10 })
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Failed to load conversation history</p>
          <Link href="/home">
            <Button label="Go Home" className="mt-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <TopBar title="Conversation history" backButton={false} />
      <div className="mx-auto max-w-3xl px-4 py-6 pt-20">
        {history.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <Clock className="mb-6 h-16 w-16 text-gray-400" />
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              No conversations yet
            </h2>
            <p className="mb-8 max-w-sm text-gray-600">
              Start a live conversation to see your history here
            </p>
            <Link href="/home">
              <Button label="Start conversation" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Conversations
            </h2>
            <div className="space-y-3">
              {history.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/chat/${conversation.id}`}
                  className="block"
                >
                  <div className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {conversation.scenarioTitle}
                        </h3>
                        {conversation.scenarioContext && (
                          <p className="mt-1 text-sm text-gray-600">
                            {conversation.scenarioContext.substring(0, 100)}...
                          </p>
                        )}
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <span>
                            {new Date(
                              conversation.createdAt,
                            ).toLocaleDateString()}{' '}
                            {new Date(
                              conversation.createdAt,
                            ).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{conversation.targetLanguage}</span>
                          <span className="mx-2">•</span>
                          <span>{conversation.messages.length} messages</span>
                        </div>
                      </div>
                      <MessageCircle className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
