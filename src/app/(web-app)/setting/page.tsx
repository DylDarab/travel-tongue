import UserInfoCard from '@/app/(web-app)/_components/UserInfoCard'
import { GENDER, LANGUAGES, TRAVEL_PREFERENCES } from '@/constants'
import { auth } from '@/server/auth'
import { api } from '@/trpc/server'
import { FileText, Heart, User } from 'lucide-react'
import { redirect } from 'next/navigation'

function getLanguageLabel(languageCode: string | null | undefined): string {
  if (!languageCode) return 'Not specified'
  const language = LANGUAGES.find((lang) => lang.value === languageCode)
  return language?.label ?? languageCode
}

function getTravelPreferencesLabels(
  preferences: string[] | null | undefined,
): string {
  if (!preferences || preferences.length === 0) return 'None selected'

  const labels = preferences.map((pref) => {
    const preference = TRAVEL_PREFERENCES.find((p) => p.value === pref)
    return preference?.label ?? pref
  })

  return labels.join(', ')
}

function getGenderLabel(gender: string | null | undefined): string {
  if (!gender) return 'Not specified'
  const genderOption = GENDER.find((g) => g.value === gender)
  return genderOption?.label ?? gender
}

export default async function SettingPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/')
  }

  const user = await api.users.getUserProfile()

  if (!user) {
    redirect('/')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-20">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Settings</h1>

      <div className="space-y-6">
        <UserInfoCard
          icon={User}
          title="Profile"
          description="Your personal information for better conversations."
          info={{
            'Display name': user.displayName ?? 'Not specified',
            'Real name': user.realName ?? 'Not specified',
            Gender: getGenderLabel(user.gender),
            'Default language': getLanguageLabel(user.preferredLanguage),
          }}
          displayEditButton={true}
          editHref="/edit-profile"
        />

        <UserInfoCard
          icon={Heart}
          title="Travel preferences"
          description="Your travel style and dietary preferences."
          info={{
            Preferences: getTravelPreferencesLabels(user.travelPreferences),
            Allergies: user.foodAllergies ?? 'None specified',
            Religion: user.religion ?? 'Not specified',
          }}
        />

        <UserInfoCard
          icon={FileText}
          title="Personal context"
          description="Additional information for better AI assistance."
          info={{
            Notes: user.personalNotes ?? 'No additional context provided',
          }}
        />
      </div>
    </div>
  )
}
