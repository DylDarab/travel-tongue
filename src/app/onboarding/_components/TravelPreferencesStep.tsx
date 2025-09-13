'use client'

import { TRAVEL_PREFERENCES } from '@/constants'
import { useFormContext } from 'react-hook-form'
import TextInput from '@/components/TextInput'
import MultipleSelectChips from '@/components/MultipleSelectChips'
import type { OnboardingFormData } from '../_hooks/types'

const TravelPreferencesStep = () => {
  const { register, watch, setValue } = useFormContext<OnboardingFormData>()

  const travelPreferences = watch('travelPreferences')

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-teal-500">
          <svg
            className="h-8 w-8 text-teal-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Travel preferences</h2>
        <p className="mt-2 text-gray-600">
          Select what applies to you for better recommendations
        </p>
      </div>

      <div className="space-y-6">
        <MultipleSelectChips
          label="Your preferences (select any that apply)"
          options={TRAVEL_PREFERENCES}
          selectedValues={travelPreferences ?? []}
          onChange={(values) => setValue('travelPreferences', values)}
        />

        <TextInput
          label="Food allergies & restrictions"
          placeholder="e.g., Nuts, shellfish, dairy, etc."
          {...register('foodAllergies')}
        />

        <div>
          <TextInput
            label="Religion or cultural considerations"
            placeholder="e.g., Muslim, Jewish, Hindu, Buddhist, etc."
            {...register('religion')}
          />
          <p className="mt-1 text-sm text-gray-500">
            Helps us suggest culturally appropriate phrases
          </p>
        </div>
      </div>
    </div>
  )
}

export default TravelPreferencesStep
