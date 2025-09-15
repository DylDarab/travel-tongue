'use client'

import OnboardingForm from './_components/OnboardingForm'
import { useOnboardingStore } from './_stores'
import { OnboardingSteps } from './types'

export default function OnboardingPage() {
  const { onboardingStep } = useOnboardingStore()
  const currentStepIndex = OnboardingSteps.indexOf(onboardingStep) + 1
  const totalSteps = OnboardingSteps.length

  return (
    <div className="flex h-screen flex-col">
      <div className="px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Setup</h1>
          <div className="text-sm text-gray-600">
            Step {currentStepIndex} of {totalSteps}
          </div>
        </div>
        <div className="mb-6 h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-teal-500 transition-all duration-300"
            style={{ width: `${(currentStepIndex / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        <OnboardingForm />
      </div>
    </div>
  )
}
