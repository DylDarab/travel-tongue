'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

import { TopBar } from '@/app/_components/TopBar'
import Button from '@/components/Button'
import { api } from '@/trpc/react'
import AdditionalContextSection from './_components/AdditionalContextSection'
import PersonalInfoSection from './_components/PersonalInfoSection'
import ProfileProgress from './_components/ProfileProgress'
import TravelPreferencesSection from './_components/TravelPreferencesSection'
import type { ProfileUpdateFormData } from './_schemas/profileUpdate'
import { profileUpdateSchema } from './_schemas/profileUpdate'

export default function EditProfilePage() {
  const router = useRouter()
  const utils = api.useUtils()

  const { data: user, isLoading: isLoadingUser } =
    api.users.getUserProfile.useQuery()
  const { mutate: updateProfile, isPending: isUpdating } =
    api.users.updateUserProfile.useMutation({
      onSuccess: async () => {
        await utils.users.getUserProfile.invalidate()
        router.push('/setting')
      },
    })

  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      displayName: user?.displayName ?? '',
      realName: user?.realName ?? '',
      gender: user?.gender ?? undefined,
      preferredLanguage: user?.preferredLanguage ?? undefined,
      travelPreferences: user?.travelPreferences ?? [],
      foodAllergies: user?.foodAllergies ?? '',
      religion: user?.religion ?? '',
      personalNotes: user?.personalNotes ?? '',
    },
  })

  const onSubmit = (data: ProfileUpdateFormData) => {
    if (!user?.id) return

    updateProfile({
      id: user.id,
      displayName: data.displayName,
      realName: data.realName,
      gender: data.gender,
      preferredLanguage: data.preferredLanguage,
      travelPreferences: data.travelPreferences,
      foodAllergies: data.foodAllergies,
      religion: data.religion,
      personalNotes: data.personalNotes,
    })
  }

  if (isLoadingUser) {
    return (
      <>
        <TopBar title="Edit Profile" backButton={true} />
        <div className="mx-auto max-w-3xl px-4 py-6 pt-20">
          <div className="animate-pulse space-y-6">
            <div className="h-8 rounded bg-gray-200"></div>
            <div className="h-32 rounded bg-gray-200"></div>
            <div className="h-32 rounded bg-gray-200"></div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title="Edit Profile" backButton={true} />
      <div className="mx-auto max-w-3xl px-4 py-6 pt-20">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <ProfileProgress className="mb-6" />
          <PersonalInfoSection form={form} />
          <TravelPreferencesSection form={form} />
          <AdditionalContextSection form={form} />

          <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 border-t border-gray-200 pt-8 sm:flex-row">
            <div className="text-sm text-gray-500">
              {Object.keys(form.formState.dirtyFields ?? {}).length} field(s)
              modified
            </div>
            <div className="flex w-full space-x-4 sm:w-auto">
              <Button
                label="Cancel"
                type="button"
                variant="outline"
                onClick={() => router.push('/setting')}
                disabled={isUpdating}
              />
              <Button
                label="Save Changes"
                type="submit"
                loading={isUpdating}
                disabled={isUpdating || !form.formState.isDirty}
              />
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
