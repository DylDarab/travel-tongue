import { Clock } from 'lucide-react'

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-20">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Conversation history
      </h1>

      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <Clock className="mb-6 h-16 w-16 text-gray-400" />
        <h2 className="mb-3 text-xl font-semibold text-gray-900">
          No conversations yet
        </h2>
        <p className="mb-8 max-w-sm text-gray-600">
          Start a live conversation to see your history here
        </p>
        <button className="rounded-xl bg-teal-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-teal-600">
          Start conversation
        </button>
      </div>
    </div>
  )
}
