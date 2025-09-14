import { Mic, Plus, Clock } from 'lucide-react'
import MenuButton from '@/app/(web-app)/_components/MenuButton'
import ScenarioCard from '@/app/(web-app)/_components/ScenarioCard'
import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'

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

      <div className="mb-8 flex justify-between gap-4">
        <MenuButton label="Start Live" icon={Mic} path="/live" />
        <MenuButton label="Soundpads" icon={Plus} path="/soundpad" />
      </div>

      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Suggested scenarios
        </h2>
 
        <ScenarioCard
          title="Sushi restaurant"
          description="3 friends, ¥5000 budget each"
          language="ja-JP"
          phrasesAmount={14}
        />
      </div>
    </div>
  )
}
