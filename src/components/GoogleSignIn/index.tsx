'use client'

import { signIn } from '@/server/auth'
import Image from 'next/image'

export default function GoogleSignIn() {
  const handleGoogleSignIn = async () => {
    await signIn('google')
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      className="flex gap-2 rounded-lg border border-slate-200 px-4 py-2 text-slate-700 transition duration-150 hover:border-slate-400 hover:text-slate-900 hover:shadow dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-slate-300"
    >
      <Image
        width={24}
        height={24}
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        loading="lazy"
        alt="google logo"
      />
      <span>Login with Google</span>
    </button>
  )
}
