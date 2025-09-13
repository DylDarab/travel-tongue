'use client'

import clsx from 'clsx'
import { History, House, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Navbar = () => {
  const currentPath = usePathname()

  const navLinks = [
    { href: '/home', label: 'Home', icon: House },
    { href: '/history', label: 'History', icon: History },
    { href: '/setting', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="fixed bottom-0 flex w-full justify-between gap-8 border-t border-gray-200 bg-white/95 px-4 py-2 backdrop-blur-sm">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive = currentPath === href

        return (
          <Link key={href} href={href} className="flex-1">
            <button
              className={clsx(
                'group relative flex h-full w-full flex-col items-center justify-center gap-1 rounded-2xl py-3 transition-all duration-300 ease-out hover:scale-105 active:scale-95',
                isActive
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-teal-600',
              )}
            >
              <div className="relative">
                <Icon
                  className={clsx(
                    'h-5 w-5 transition-all duration-300',
                    isActive
                      ? 'scale-110 text-white'
                      : 'text-gray-600 group-hover:scale-110 group-hover:text-teal-600',
                  )}
                />
                {isActive && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 animate-pulse rounded-full bg-white" />
                )}
              </div>
              <span
                className={clsx(
                  'text-xs font-medium transition-all duration-300',
                  isActive
                    ? 'text-white'
                    : 'text-gray-600 group-hover:text-teal-600',
                )}
              >
                {label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-white transition-all duration-300" />
              )}
            </button>
          </Link>
        )
      })}
    </div>
  )
}

export default Navbar
