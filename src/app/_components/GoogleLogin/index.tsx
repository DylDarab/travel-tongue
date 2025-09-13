'use client'

import Button from '@/components/Button'
import { LogIn } from 'lucide-react'
import { signIn } from 'next-auth/react'

const GoogleLogin = () => {
  const handleGoogleSignIn = async () => {
    await signIn('google')
  }

  return (
    <Button
      className="mt-8"
      label="Sign in with Google"
      variant="primary"
      size="lg"
      leftIcon={<LogIn />}
      fullWidth
      onClick={handleGoogleSignIn}
    />
  )
}

export default GoogleLogin
