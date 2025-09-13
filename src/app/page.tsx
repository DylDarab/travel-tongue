import { HydrateClient } from '@/trpc/server'
import { auth } from '@/server/auth'
import { isUserProfileComplete } from '@/server/api/services/userRepo'
import { redirect } from 'next/navigation'
import { CloudLightning, MessageCircle, Mic, Shield } from 'lucide-react'
import FeatureCard from './_components/FeatureCard'
import GoogleLogin from './_components/GoogleLogin'

export default async function Home() {
  const session = await auth()

  if (session?.user?.id) {
    const isProfileComplete = await isUserProfileComplete(session.user.id)

    if (!isProfileComplete) {
      redirect('/onboarding')
    }

    redirect('/home')
  }

  return (
    <HydrateClient>
      <main className="mx-auto max-w-2xl bg-teal-50">
        <div className="flex w-full flex-col items-center justify-center px-4 py-12">
          <div className="rounded-full bg-teal-600 p-6">
            <MessageCircle className="h-12 w-12 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">TravelTongue</h1>
          <p className="text-md mt-2 text-gray-500">
            Your polite travel conversation assistant
          </p>
          <div className="mt-6 w-full space-y-4">
            <FeatureCard
              title="Quick Soundpads"
              subtitle="Pre-made phrase collections for any situations"
              icon={<CloudLightning />}
            />
            <FeatureCard
              title="Live Conversations"
              subtitle="Real-time voice with smart reply suggestions"
              icon={<Mic />}
            />
            <FeatureCard
              title="Always Polite"
              subtitle="Culturally appropriate, respectful phrases"
              icon={<Shield />}
            />
          </div>
          <GoogleLogin />
          <span className="mt-3 text-sm text-gray-500">
            Free to use • Privacy-focused • No PII collection
          </span>
        </div>
      </main>
    </HydrateClient>
  )
}
