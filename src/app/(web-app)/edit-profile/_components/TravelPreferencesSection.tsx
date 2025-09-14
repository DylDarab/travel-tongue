'use client'

import MultipleSelectChips from '@/components/MultipleSelectChips'
import TextInput from '@/components/TextInput'
import { TRAVEL_PREFERENCES } from '@/constants'
import type { UseFormReturn } from 'react-hook-form'
import type { ProfileUpdateFormData } from '../_schemas/profileUpdate'

interface TravelPreferencesSectionProps {
  form: UseFormReturn<ProfileUpdateFormData>
}

const TravelPreferencesSection = ({ form }: TravelPreferencesSectionProps) => {
  const { register, watch, setValue } = form

  const travelPreferences = watch('travelPreferences') ?? []

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <svg
            className="h-5 w-5 text-teal-600"
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
          <h2 className="text-lg font-semibold text-teal-500">
            Travel preferences
          </h2>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Your travel style and dietary preferences
        </p>
      </div>

      <div className="space-y-6">
        <MultipleSelectChips
          label="Your preferences (select any that apply)"
          options={TRAVEL_PREFERENCES}
          selectedValues={travelPreferences}
          onChange={(values) => setValue('travelPreferences', values)}
          aria-describedby="preferences-help"
        />
        <p id="preferences-help" className="mt-2 text-sm text-gray-500">
          Select all that describe your travel style and interests
        </p>

        <TextInput
          label="Food allergies & restrictions"
          placeholder="e.g., Nuts, shellfish, dairy, etc."
          aria-describedby="allergies-help"
          {...register('foodAllergies')}
        />
        <p id="allergies-help" className="mt-1 text-sm text-gray-500">
          Important for restaurant and food-related conversations
        </p>

        <div>
          <TextInput
            label="Religion or cultural considerations"
            placeholder="e.g., Muslim, Jewish, Hindu, Buddhist, etc."
            {...register('religion')}
          />
          <p id="religion-help" className="mt-1 text-sm text-gray-500">
            Helps us suggest culturally appropriate phrases
          </p>
        </div>
      </div>
    </div>
  )
}

export default TravelPreferencesSection
