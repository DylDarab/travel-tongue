'use client'

import Textarea from '@/components/Textarea'
import { LANGUAGES, TRAVEL_PREFERENCES } from '@/constants'
import type { UseFormReturn } from 'react-hook-form'
import type { ProfileUpdateFormData } from '../_schemas/profileUpdate'

interface AdditionalContextSectionProps {
  form: UseFormReturn<ProfileUpdateFormData>
}

const AdditionalContextSection = ({ form }: AdditionalContextSectionProps) => {
  const { register, watch } = form

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
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-teal-500">
            Additional context
          </h2>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Additional information for better AI assistance
        </p>
      </div>

      <div className="space-y-6">
        <Textarea
          label="Personal notes"
          placeholder="Travel style, interests, concerns, accessibility needs, budget range, or anything else that would help us generate better conversation suggestions..."
          rows={4}
          aria-describedby="personalNotes-help"
          {...register('personalNotes')}
        />
        <p id="personalNotes-help" className="text-sm text-gray-500">
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
                {getPreferencesLabel(formData.travelPreferences ?? [])}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdditionalContextSection
