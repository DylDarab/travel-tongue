import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { Mic, Plus, Clock, Star } from 'lucide-react'

export default async function HomePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-20">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">TravelTongue</h1>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <button className="flex flex-col items-center space-y-3 rounded-2xl bg-teal-500 p-6 text-white transition-colors hover:bg-teal-600">
          <Mic className="h-8 w-8" />
          <span className="text-lg font-semibold">Start Live</span>
        </button>

        <button className="flex flex-col items-center space-y-3 rounded-2xl border border-gray-200 bg-white p-6 text-gray-700 transition-colors hover:bg-gray-50">
          <Plus className="h-8 w-8" />
          <span className="text-lg font-semibold">Soundpads</span>
        </button>
      </div>

      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent conversations
          </h2>
          <button className="font-medium text-teal-600 hover:text-teal-700">
            View all
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
          <Clock className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <p className="text-gray-600">No conversations yet</p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Suggested scenarios
        </h2>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="mb-1 font-semibold text-gray-900">
                Sushi restaurant
              </h3>
              <p className="text-sm text-gray-600">
                3 friends, ¥5000 budget each
              </p>
            </div>
            <button className="text-gray-400 transition-colors hover:text-yellow-500">
              <Star className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="rounded-full bg-gray-100 px-2 py-1">ja-JP</span>
            <span>14 phrases</span>
          </div>
        </div>
      </div>
    </div>
  )
}
