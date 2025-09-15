'use client'

import SelectInput from '@/components/SelectInput'
import TextInput from '@/components/TextInput'
import { GENDER, LANGUAGES } from '@/constants'
import type { UseFormReturn } from 'react-hook-form'
import type { ProfileUpdateFormData } from '../_schemas/profileUpdate'

interface PersonalInfoSectionProps {
  form: UseFormReturn<ProfileUpdateFormData>
}

const PersonalInfoSection = ({ form }: PersonalInfoSectionProps) => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form

  const genderValue = watch('gender')
  const preferredLanguageValue = watch('preferredLanguage')

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <svg
            className="h-5 w-5 text-teal-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-teal-500">
            Personal information
          </h2>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Your personal information for better conversations
        </p>
      </div>

      <div className="space-y-4">
        <TextInput
          label="Display name"
          isRequired
          isError={!!errors.displayName}
          errorMessage={errors.displayName?.message}
          placeholder="Enter your display name"
          aria-describedby="displayName-help"
          {...register('displayName')}
        />
        <p id="displayName-help" className="mt-1 text-sm text-gray-500">
          This is how other users will see you in the app
        </p>

        <div>
          <TextInput
            label="Real name"
            isRequired
            isError={!!errors.realName}
            errorMessage={errors.realName?.message}
            placeholder="Enter your real name"
            {...register('realName')}
          />
          <p id="realName-help" className="mt-1 text-sm text-gray-500">
            Used when introducing yourself in conversations
          </p>
        </div>

        <SelectInput
          label="Gender"
          placeholder="Select your gender"
          options={GENDER}
          value={genderValue}
          onValueChange={(value) =>
            setValue(
              'gender',
              value as 'male' | 'female' | 'nonbinary' | 'prefer_not_to_say',
            )
          }
          aria-describedby="gender-help"
        />
        <p id="gender-help" className="mt-1 text-sm text-gray-500">
          Helps us provide more personalized conversation suggestions
        </p>

        <SelectInput
          label="Preferred target language"
          placeholder="Select a language"
          options={LANGUAGES}
          value={preferredLanguageValue}
          onValueChange={(value) => setValue('preferredLanguage', value)}
          aria-describedby="language-help"
        />
        <p id="language-help" className="mt-1 text-sm text-gray-500">
          The language you want to practice and learn phrases for
        </p>
      </div>
    </div>
  )
}

export default PersonalInfoSection
