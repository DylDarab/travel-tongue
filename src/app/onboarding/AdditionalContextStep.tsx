'use client'

import { LANGUAGES, TRAVEL_PREFERENCES } from '@/constants'
import { useFormContext } from 'react-hook-form'
import Textarea from '@/components/Textarea'
import type { OnboardingFormData } from './_hooks/types'

const AdditionalContextStep = () => {
  const { register, watch } = useFormContext<OnboardingFormData>()

  const formData = watch()

  const getLanguageLabel = (value: string) => {
    const language = LANGUAGES.find((lang) => lang.value === value)
    return language ? language.label : value
  }

  const getPreferencesLabel = (values: string[]) => {
    if (!values || values.length === 0) return 'None selected'
    return values
      .map((value) => {
        const preference = TRAVEL_PREFERENCES.find(
          (pref) => pref.value === value,
        )
        return preference ? preference.label : value
      })
      .join(', ')
  }

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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Additional context</h2>
        <p className="mt-2 text-gray-600">
          Any other information that helps us assist you better
        </p>
      </div>

      <div className="space-y-6">
        <Textarea
          label="Personal notes"
          placeholder="Travel style, interests, concerns, accessibility needs, budget range, or anything else that would help us generate better conversation suggestions..."
          rows={4}
          {...register('personalNotes')}
        />
        <p className="text-sm text-gray-500">
          This information helps our AI generate more relevant phrases and
          responses
        </p>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 text-sm font-medium text-gray-900">
            Profile summary
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-900">Name:</span>{' '}
              <span className="text-gray-600">
                {formData.realName ?? 'Not provided'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Language:</span>{' '}
              <span className="text-gray-600">
                {formData.preferredLanguage
                  ? getLanguageLabel(formData.preferredLanguage)
                  : 'Not selected'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Preferences:</span>{' '}
              <span className="text-gray-600">
                {getPreferencesLabel(formData.travelPreferences)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdditionalContextStep
