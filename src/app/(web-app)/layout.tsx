import { redirect } from 'next/navigation'

import { auth } from '@/server/auth'
import Navbar from './_components/Navbar'

export default async function WebAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/')
  }

  return (
    <div className="bg-white">
      <main>{children}</main>
      <Navbar />
    </div>
  )
}
