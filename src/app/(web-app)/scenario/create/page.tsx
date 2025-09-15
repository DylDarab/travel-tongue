'use client'

import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/app/_components/TopBar'
import Button from '@/components/Button'
import TextInput from '@/components/TextInput'
import Textarea from '@/components/Textarea'
import SelectInput from '@/components/SelectInput'
import { api } from '@/trpc/react'
import { LANGUAGES } from '@/constants'

export default function CreateScenarioPage() {
  const [scenarioName, setScenarioName] = useState('')
  const [context, setContext] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('ja-JP')
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const createScenarioMutation = api.scenarios.createScenario.useMutation()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsGenerating(true)

    try {
      const scenario = await createScenarioMutation.mutateAsync({
        title: scenarioName,
        context: context,
        targetLang: selectedLanguage,
        tags: [],
        pinned: false,
      })

      if (scenario) {
        router.push(`/scenario/${scenario.id}`)
      }
    } catch (error) {
      console.error('Error creating scenario:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <TopBar title="Create scenario" backButton={true} />
      <div className="mx-auto max-w-3xl px-4 py-6 pt-20 pb-20">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
            <Sparkles className="h-8 w-8 text-teal-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            AI-powered scenario
          </h2>
          <p className="text-gray-600">
            Describe your situation and we&apos;ll generate polite, culturally
            appropriate phrases.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TextInput
            label="Scenario Name"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            placeholder="e.g., Coffee shop, Train station, Hotel check-in"
            isRequired
          />

          <div>
            <Textarea
              label="Context & situation"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={4}
              placeholder="Describe the situation in detail. Include: Who you're with, your budget/constraints, what you want to accomplish, any special needs..."
              isRequired
            />
            <p className="mt-2 text-sm text-gray-500">
              More context = better phrases. Be specific!
            </p>
          </div>

          <SelectInput
            label="Target language"
            options={LANGUAGES}
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
            isRequired
          />

          <Button
            label={
              isGenerating ? 'Creating scenario...' : 'Create scenario with AI'
            }
            leftIcon={
              isGenerating ? undefined : <Sparkles className="h-4 w-4" />
            }
            fullWidth
            loading={isGenerating}
            disabled={isGenerating}
            type="submit"
          />

          <p className="text-center text-sm text-gray-500">
            This usually takes 15-30 seconds
          </p>
        </form>
      </div>
    </>
  )
}
