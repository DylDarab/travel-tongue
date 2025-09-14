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
      className="flex w-full flex-col items-center space-y-3 rounded-2xl border border-gray-300 px-6 py-3 text-black transition-colors hover:bg-teal-600 hover:text-white"
    >
      <Icon className="h-6 w-6" />
      <span className="text-md font-semibold">{label}</span>
    </Link>
  )
}

export default MenuButton
