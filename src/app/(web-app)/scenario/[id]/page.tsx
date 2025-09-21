'use client'

import { use } from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PhraseCard from '@/app/(web-app)/_components/PhraseCard'
import AddPhraseCard from '@/app/(web-app)/_components/AddPhraseCard'
import AddPhraseModal from '@/app/(web-app)/_components/AddPhraseModal'
import { TopBar } from '@/app/_components/TopBar'
import { api } from '@/trpc/react'
import { groupPhrasesByGroup } from './_utils/phraseUtils'
import type { PhraseGroup } from './_utils/types'
import { USER_CUSTOM_GROUP } from '@/constants'
import { MessageCircle } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

const ScenarioDetailPage = ({ params }: PageProps) => {
  const { id } = use(params)
  const [phraseGroups, setPhraseGroups] = useState<PhraseGroup[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const router = useRouter()

  const {
    data: scenario,
    isLoading: isLoadingScenario,
    refetch: refetchScenario,
  } = api.scenarios.getScenario.useQuery(
    { id },
    {
      enabled: !!id,
    },
  )

  const {
    data: phrases,
    isLoading: isLoadingPhrases,
    refetch: refetchPhrases,
  } = api.scenarios.getScenarioPhrases.useQuery(
    { scenarioId: id },
    {
      enabled: !!id,
    },
  )

  const createConversation = api.conversations.createConversation.useMutation()
  const addMessage = api.conversations.addMessage.useMutation()

  const handleSendPhrase = async (phrase: { localDialogue: string }) => {
    if (isCreatingChat) return

    setIsCreatingChat(true)
    try {
      const conversation = await createConversation.mutateAsync({
        targetLanguage: scenario?.targetLang ?? 'ja',
        scenarioId: id,
      })

      await addMessage.mutateAsync({
        conversationId: conversation.id,
        text: phrase.localDialogue,
        isUserMessage: true,
        language: 'ja',
        translatedText: phrase.localDialogue,
      })

      router.push(`/chat/${conversation.id}`)
    } catch (error) {
      console.error('Failed to create conversation:', error)
      setIsCreatingChat(false)
    }
  }

  const isLoading = isLoadingScenario || isLoadingPhrases

  useEffect(() => {
    if (phrases && scenario) {
      const phraseGroupsArray = groupPhrasesByGroup(phrases, scenario)
      setPhraseGroups(phraseGroupsArray)
    }
  }, [phrases, scenario])

  useEffect(() => {
    console.log('Scenario data loaded:', scenario)
    if (scenario?.targetLang) {
      console.log('Scenario targetLang:', scenario.targetLang)
    } else if (scenario) {
      console.log('Scenario loaded but targetLang is undefined')
    } else {
      console.log('No scenario data available')
    }
  }, [scenario])

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
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                {USER_CUSTOM_GROUP}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div onClick={() => setIsModalOpen(true)}>
                <AddPhraseCard />
              </div>
              {phraseGroups
                .find((group) => group.title === USER_CUSTOM_GROUP)
                ?.phrases.map((phrase) => (
                  <PhraseCard
                    key={phrase.id}
                    label={phrase.label}
                    displayText={phrase.localDialogue}
                    speakText={phrase.targetDialogue}
                    speakLang={phrase.speakLang}
                    onSend={() => handleSendPhrase(phrase)}
                    disabled={isCreatingChat}
                  />
                ))}
            </div>
          </div>

          {phraseGroups
            .filter((group) => group.title !== USER_CUSTOM_GROUP)
            .map((section) => (
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
                  {section.phrases.map((phrase) => (
                    <PhraseCard
                      key={phrase.id}
                      label={phrase.label}
                      displayText={phrase.localDialogue}
                      speakText={phrase.targetDialogue}
                      speakLang={phrase.speakLang}
                      onSend={() => handleSendPhrase(phrase)}
                      disabled={isCreatingChat}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
      {scenario && (
        <button
          className="fixed right-6 bottom-6 flex items-center gap-2 rounded-full bg-teal-500 px-4 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-teal-600 focus:ring-2 focus:ring-teal-300 focus:outline-none disabled:opacity-50"
          onClick={async () => {
            if (isCreatingChat) return

            setIsCreatingChat(true)
            try {
              const conversation = await createConversation.mutateAsync({
                targetLanguage: scenario.targetLang ?? 'ja',
                scenarioId: id,
              })

              router.push(`/chat/${conversation.id}`)
            } catch (error) {
              console.error('Failed to create conversation:', error)
              setIsCreatingChat(false)
            }
          }}
          disabled={isCreatingChat}
          aria-label="Start conversation with this scenario"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{isCreatingChat ? 'Creating...' : 'Start'}</span>
        </button>
      )}
      <AddPhraseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        scenarioId={id}
        targetLang={scenario?.targetLang}
        onSuccess={() => {
          void refetchPhrases()
          void refetchScenario()
        }}
      />
    </div>
  )
}

export default ScenarioDetailPage
