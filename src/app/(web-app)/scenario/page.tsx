'use client'

import ScenarioCard from '@/app/(web-app)/_components/ScenarioCard'
import { TopBar } from '@/app/_components/TopBar'
import { api } from '@/trpc/react'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { ListSkeleton } from '@/components/LoadingSkeleton'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function ScenarioPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = api.scenarios.getScenarios.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  )

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const allScenarios = data?.pages.flatMap((page) => page.items) ?? []

  const filteredScenarios = allScenarios.filter(
    (scenario) =>
      scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ??
      scenario.context?.toLowerCase().includes(searchTerm.toLowerCase()) ??
      false,
  )

  if (isLoading) {
    return (
      <>
        <TopBar title="Scenarios" backButton={false} />
        <div className="mx-auto max-w-3xl px-4 py-6 pt-20">
          <div className="mb-6 flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <div className="h-12 w-full rounded-lg border border-gray-200 bg-gray-50" />
              </div>
            </div>
            <div className="h-14 w-14 rounded-lg bg-gray-200" />
          </div>
          <ListSkeleton count={6} />
        </div>
      </>
    )
  }

  if (isError) {
    return (
      <>
        <TopBar title="Scenarios" backButton={false} />
        <div className="mx-auto max-w-3xl px-4 py-6 pt-20">
          <div className="flex items-center justify-center py-12">
            <div className="text-red-500">Error loading scenarios</div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title="Scenarios" backButton={false} />
      <div className="mx-auto max-w-3xl px-4 py-6 pt-20">
        <div className="mb-6 flex gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search scenarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
              />
            </div>
          </div>
          <Link
            href="/scenario/create"
            className="flex h-14 w-14 touch-manipulation items-center justify-center rounded-lg bg-teal-500 text-white transition-colors hover:bg-teal-600"
          >
            <Plus className="h-6 w-6" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredScenarios.map((scenario) => (
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

        {isFetchingNextPage && (
          <div className="mt-8 flex items-center justify-center">
            <LoadingSpinner className="text-teal-500" />
            <span className="ml-2 text-gray-500">
              Loading more scenarios...
            </span>
          </div>
        )}

        {hasNextPage && <div ref={ref} className="mt-8 h-10" />}

        {filteredScenarios.length === 0 && !isLoading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No scenarios found
            </h3>
            <p className="mb-6 text-gray-600">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Create your first scenario to get started'}
            </p>
            <Link
              href="/scenario/create"
              className="inline-flex touch-manipulation items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-white transition-colors hover:bg-teal-600"
            >
              <Plus className="h-5 w-5" />
              Create scenario
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
