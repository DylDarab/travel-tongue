'use client'

import SelectInput from '@/components/SelectInput'
import TextInput from '@/components/TextInput'
import { GENDER, LANGUAGES } from '@/constants'
import { useFormContext } from 'react-hook-form'

const PersonalInfoStep = () => {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext()

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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Personal information
        </h2>
        <p className="mt-2 text-gray-600">
          Help us personalize your travel conversations
        </p>
      </div>

      <div className="space-y-4">
        <TextInput
          label="Display name"
          isRequired
          isError={!!errors.displayName}
          errorMessage={errors.displayName?.message as string}
          placeholder="Enter your display name"
          {...register('displayName', {
            required: 'Display name is required',
          })}
        />

        <div>
          <TextInput
            label="Real name"
            isRequired
            isError={!!errors.realName}
            errorMessage={errors.realName?.message as string}
            placeholder="Enter your real name"
            {...register('realName', {
              required: 'Real name is required',
            })}
          />
          <p className="mt-1 text-sm text-gray-500">
            Used when introducing yourself in conversations
          </p>
        </div>

        <SelectInput
          label="Gender"
          placeholder="Select your gender"
          options={GENDER}
          {...register('gender')}
          onValueChange={(value) => setValue('gender', value)}
        />

        <SelectInput
          label="Preferred target language"
          placeholder="Select a language"
          options={LANGUAGES}
          {...register('preferredLanguage')}
          onValueChange={(value) => setValue('preferredLanguage', value)}
        />
      </div>
    </div>
  )
}

export default PersonalInfoStep
