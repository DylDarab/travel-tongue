import { ArrowLeft, Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { TopBar } from '@/app/_components/TopBar'
import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import ScenarioCard from '@/app/(web-app)/_components/ScenarioCard'

interface ScenarioItem {
  id: string
  name: string
  language: string
  phrasesCount: number
  description: string
}

const mockScenarioItems: ScenarioItem[] = [
  {
    id: '1',
    name: 'Sushi restaurant',
    language: 'ja-JP',
    phrasesCount: 14,
    description: '3 friends, ¥5000 budget each',
  },
  {
    id: '2',
    name: 'Hotel check-in',
    language: 'en-US',
    phrasesCount: 8,
    description: 'Business trip, need early check-in',
  },
  {
    id: '3',
    name: 'Train station',
    language: 'ja-JP',
    phrasesCount: 12,
    description: 'First time using JR Pass',
  },
  {
    id: '4',
    name: 'Coffee shop',
    language: 'fr-FR',
    phrasesCount: 6,
    description: 'Morning coffee, lactose intolerant',
  },
]

export default async function ScenarioPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/')
  }

  return (
    <>
      <TopBar
        title="Scenarios"
        backButton={false}
      />
      <div className="mx-auto max-w-3xl px-4 py-6 pb-20 pt-20">
        <div className="mb-6 flex gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search scenarios..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
              />
            </div>
          </div>
          <Link
            href="/scenario/create"
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-600 text-white transition-colors hover:bg-teal-700"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockScenarioItems.map((item) => (
            <ScenarioCard
              key={item.id}
              title={item.name}
              description={item.description}
              language={item.language}
              phrasesAmount={item.phrasesCount}
            />
          ))}
        </div>

        {mockScenarioItems.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No scenarios yet
            </h3>
            <p className="mb-6 text-gray-600">
              Create your first scenario to get started
            </p>
            <Link
              href="/scenario/create"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" />
              Create scenario
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
