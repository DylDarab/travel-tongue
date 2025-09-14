'use client'

import { useFormContext } from 'react-hook-form'
import type { ProfileUpdateFormData } from '../_schemas/profileUpdate'

interface ProfileProgressProps {
  className?: string
}

const ProfileProgress: React.FC<ProfileProgressProps> = ({ className }) => {
  const { watch } = useFormContext<ProfileUpdateFormData>()
  const formData = watch()

  const requiredFields = ['displayName', 'realName']

  const optionalFields = [
    'gender',
    'preferredLanguage',
    'travelPreferences',
    'foodAllergies',
    'religion',
    'personalNotes',
  ]

  const getCompletionPercentage = () => {
    const requiredCompleted = requiredFields.filter((field) => {
      const value = formData[field as keyof ProfileUpdateFormData]
      return value && value.toString().trim().length > 0
    }).length

    const optionalCompleted = optionalFields.filter((field) => {
      const value = formData[field as keyof ProfileUpdateFormData]
      if (field === 'travelPreferences') {
        return Array.isArray(value) && value.length > 0
      }
      return value && value.toString().trim().length > 0
    }).length

    const totalRequiredWeight = requiredFields.length * 2
    const totalOptionalWeight = optionalFields.length * 1
    const totalWeight = totalRequiredWeight + totalOptionalWeight

    const weightedScore = requiredCompleted * 2 + optionalCompleted
    const percentage = Math.round((weightedScore / totalWeight) * 100)

    return Math.min(percentage, 100)
  }

  const completionPercentage = getCompletionPercentage()

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Profile completion
        </span>
        <span className="text-sm text-gray-500">{completionPercentage}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-teal-500 transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {completionPercentage < 50 &&
          'Add more details to improve your experience'}
        {completionPercentage >= 50 &&
          completionPercentage < 80 &&
          'Good start! A few more details would help'}
        {completionPercentage >= 80 &&
          'Excellent! Your profile is well-rounded'}
      </p>
    </div>
  )
}

export default ProfileProgress
