import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface MenuButtonProps {
  label: string
  icon: LucideIcon
  path: string
}

const MenuButton = ({ label, icon: Icon, path }: MenuButtonProps) => {
  return (
    <Link
      href={path}
      className="flex min-h-[88px] w-full touch-manipulation flex-col items-center space-y-3 rounded-2xl border border-gray-300 px-6 py-4 text-black transition-colors hover:bg-teal-500 hover:text-white"
    >
      <Icon className="h-8 w-8" />
      <span className="text-md font-semibold">{label}</span>
    </Link>
  )
}

export default MenuButton
