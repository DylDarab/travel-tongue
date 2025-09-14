'use client'

import { use } from 'react'
import { useState, useEffect } from 'react'
import PhraseCard from '@/app/(web-app)/_components/PhraseCard'
import AddPhraseCard from '@/app/(web-app)/_components/AddPhraseCard'
import AddPhraseModal from '@/app/(web-app)/_components/AddPhraseModal'
import { TopBar } from '@/app/_components/TopBar'
import { api } from '@/trpc/react'
import { groupPhrasesByGroup } from './_utils/phraseUtils'
import type { PhraseGroup } from './_utils/types'

interface PageProps {
  params: Promise<{ id: string }>
}

const ScenarioDetailPage = ({ params }: PageProps) => {
  const { id } = use(params)
  const [phraseGroups, setPhraseGroups] = useState<PhraseGroup[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: scenario, isLoading: isLoadingScenario } =
    api.scenarios.getScenario.useQuery(
      { id },
      {
        enabled: !!id,
      },
    )

  const { data: phrases, isLoading: isLoadingPhrases } =
    api.scenarios.getScenarioPhrases.useQuery(
      { scenarioId: id },
      {
        enabled: !!id,
      },
    )

  const isLoading = isLoadingScenario || isLoadingPhrases

  useEffect(() => {
    if (phrases && scenario) {
      const phraseGroupsArray = groupPhrasesByGroup(phrases, scenario)
      setPhraseGroups(phraseGroupsArray)
    }
  }, [phrases, scenario])

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col bg-gray-50">
        <TopBar title="Loading..." description="" backButton={true} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-gray-500">Loading scenario...</div>
        </div>
      </div>
    )
  }

  if (!scenario) {
    return (
      <div className="flex h-screen flex-col bg-gray-50">
        <TopBar title="Scenario not found" description="" backButton={true} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-gray-500">Scenario not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <TopBar
        title={scenario.title}
        description={scenario.context ?? ''}
        backButton={true}
      />
      <div className="p-4 pt-20 pb-24">
        <div className="space-y-6">
          {phraseGroups.map((section) => (
            <div key={section.id} className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  {section.title} ({section.phrases.length})
                </h2>
                <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                  <span>↑</span>
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {section.phrases.map((phrase) => {
                  return (
                    <PhraseCard
                      key={phrase.id}
                      label={phrase.label}
                      displayText={phrase.localDialogue}
                      speakText={phrase.targetDialogue}
                      speakLang={phrase.speakLang}
                    />
                  )
                })}
                <div onClick={() => setIsModalOpen(true)}>
                  <AddPhraseCard />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AddPhraseModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}

export default ScenarioDetailPage
