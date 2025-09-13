import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/')
  }

  return (
    <div className="px-4 py-6">
      <h1 className="p-4 text-xl font-bold">Welcome to TravelTongue</h1>
      <p className="px-4 text-gray-600">
        Your profile is complete! You can now start using the app.
      </p>
    </div>
  )
}
