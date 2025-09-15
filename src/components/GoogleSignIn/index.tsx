'use client'

import Button from '@/components/Button'
import { LogIn } from 'lucide-react'
import { signIn } from 'next-auth/react'

const GoogleSignIn = () => {
  const handleGoogleSignIn = async () => {
    await signIn('google')
  }

  return (
    <Button
      label="Sign in with Google"
      variant="primary"
      size="lg"
      leftIcon={<LogIn />}
      fullWidth
      onClick={handleGoogleSignIn}
    />
  )
}

export default GoogleSignIn
