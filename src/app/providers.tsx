'use client'

import { SessionProvider } from 'next-auth/react'
import { type ReactNode } from 'react'

import { TRPCReactProvider } from '@/trpc/react'

type ProvidersProps = {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <TRPCReactProvider>{children}</TRPCReactProvider>
    </SessionProvider>
  )
}
