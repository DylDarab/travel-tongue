'use client'

import Button from '@/components/Button'
import { FormProvider } from 'react-hook-form'
import { useOnboardingForm } from '../_hooks/useOnboardingForm'
import { useOnboardingStore } from '../_stores'
import { OnboardingSteps } from '../types'
import PersonalInfoStep from './PersonalInfoStep'
import TravelPreferencesStep from './TravelPreferencesStep'
import { api } from '@/trpc/react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AdditionalContextStep from '../AdditionalContextStep'
import { X } from 'lucide-react'

const OnboardingForm = () => {
  const session = useSession()
  const router = useRouter()
  const methods = useOnboardingForm()

  const { onboardingStep, setOnboardingStep } = useOnboardingStore()

  const handleBack = () => {
    const currentIndex = OnboardingSteps.indexOf(onboardingStep)
    const prevStep = OnboardingSteps[currentIndex - 1]
    if (prevStep) {
      setOnboardingStep(prevStep)
    }
  }

  const handleExit = () => {
    router.push('/')
  }

  const handleContinue = async () => {
    const currentIndex = OnboardingSteps.indexOf(onboardingStep)
    const nextStep = OnboardingSteps[currentIndex + 1]
    if (nextStep) {
      setOnboardingStep(nextStep)
    }
  }

  const { mutateAsync: updateUserProfile, isPending } =
    api.users.updateUserProfile.useMutation()

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      await updateUserProfile({
        id: session.data?.user.id,
        ...data,
      })

      router.push('/home')
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <form>
        {onboardingStep === 'personalInfo' && (
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={handleExit}
              className="flex h-10 items-center justify-center rounded-md px-3 text-gray-500 hover:text-gray-700"
            >
              <X className="mr-1 h-4 w-4" />
              Exit
            </button>
          </div>
        )}

        {onboardingStep === 'personalInfo' && <PersonalInfoStep />}
        {onboardingStep === 'travelPreferences' && <TravelPreferencesStep />}
        {onboardingStep === 'additionalContext' && <AdditionalContextStep />}
      </form>

      <div className="fixed right-0 bottom-0 left-0 bg-white p-4 shadow-lg">
        <div className="mx-auto max-w-md">
          <div className="flex justify-between gap-4">
            {onboardingStep !== 'personalInfo' && (
              <Button
                label="Back"
                variant="outline"
                onClick={handleBack}
                fullWidth
                className="h-12"
              />
            )}
            {onboardingStep === 'additionalContext' ? (
              <Button
                label="Complete setup"
                variant="primary"
                onClick={handleSubmit}
                fullWidth
                loading={isPending}
                disabled={isPending}
                className="h-12"
              />
            ) : (
              <Button
                label="Continue"
                variant="primary"
                onClick={handleContinue}
                fullWidth
                className="h-12"
              />
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  )
}

export default OnboardingForm
