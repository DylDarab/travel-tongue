'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import clsx from 'clsx'

interface TopBarProps {
  title: string
  description?: string
  backButton?: boolean
  onBack?: () => void
  menuItems?: React.ReactNode
  className?: string
}

export function TopBar({
  title,
  description,
  backButton = true,
  onBack,
  menuItems,
  className,
}: TopBarProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <div
      className={clsx(
        'fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3',
        className,
      )}
    >
      <div className="flex flex-1 items-center space-x-3">
        {backButton && (
          <button
            onClick={handleBack}
            className="min-h-[48px] min-w-[48px] touch-manipulation rounded-full p-3 transition-colors hover:bg-gray-100"
            aria-label="Go back"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-medium text-gray-900">
            {title}
          </h1>
          {description && (
            <p className="mt-1 truncate text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
      {menuItems && (
        <div className="flex items-center space-x-2">{menuItems}</div>
      )}
    </div>
  )
}
