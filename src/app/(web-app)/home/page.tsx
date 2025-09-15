import { Mic, Plus, Clock } from 'lucide-react'
import MenuButton from '@/app/(web-app)/_components/MenuButton'
import ScenarioCard from '@/app/(web-app)/_components/ScenarioCard'
import { TopBar } from '@/app/_components/TopBar'
import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { api } from '@/trpc/server'
import Link from 'next/link'

export default async function HomePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/')
  }

  const latestScenarios = await api.scenarios.getLatestScenarios({})

  return (
    <>
      <TopBar title="TravelTongue" backButton={false} />
      <div className="mx-auto max-w-3xl px-4 py-6 pt-20">
        <div className="mb-8 flex justify-between gap-4">
          <MenuButton label="Start Live" icon={Mic} path="/live" />
          <MenuButton label="Scenarios" icon={Plus} path="/scenario" />
        </div>

        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent conversations
            </h2>
            <button className="font-medium text-teal-500 hover:text-teal-600">
              View all
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
            <Clock className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">No conversations yet</p>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent scenarios
            </h2>
            <Link
              href="/scenario"
              className="font-medium text-teal-500 hover:text-teal-600"
            >
              View all
            </Link>
          </div>

          {latestScenarios.items.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestScenarios.items.map((scenario) => (
                <Link
                  key={scenario.id}
                  href={`/scenario/${scenario.id}`}
                  className="block"
                >
                  <ScenarioCard
                    title={scenario.title}
                    description={scenario.context ?? ''}
                    language={scenario.targetLang}
                    phrasesAmount={scenario.phraseCount}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
              <p className="text-gray-600">No scenarios yet</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
