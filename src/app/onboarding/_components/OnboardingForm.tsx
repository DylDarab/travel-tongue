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
        {onboardingStep === 'personalInfo' && <PersonalInfoStep />}
        {onboardingStep === 'travelPreferences' && <TravelPreferencesStep />}
        {onboardingStep === 'additionalContext' && <AdditionalContextStep />}
      </form>

      <div className="mx-auto mt-8 flex justify-between gap-4">
        {onboardingStep !== 'personalInfo' && (
          <Button
            label="Back"
            variant="outline"
            onClick={handleBack}
            fullWidth
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
          />
        ) : (
          <Button
            label="Continue"
            variant="primary"
            onClick={handleContinue}
            fullWidth
          />
        )}
      </div>
    </FormProvider>
  )
}

export default OnboardingForm
