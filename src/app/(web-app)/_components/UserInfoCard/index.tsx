import { Edit } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface UserInfoCardProps {
  icon: LucideIcon
  title: string
  description: string
  info: Record<string, string>
  displayEditButton?: boolean
  editHref?: string
}

const UserInfoCard = ({
  icon: Icon,
  title,
  description,
  info,
  displayEditButton,
  editHref,
}: UserInfoCardProps) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5 text-teal-500" />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        {displayEditButton && editHref && (
          <Link
            href={editHref}
            className="flex min-h-[44px] touch-manipulation items-center space-x-2 rounded-md px-2 py-2 font-medium text-teal-500 hover:bg-teal-50 hover:text-teal-600"
          >
            <Edit className="h-5 w-5" />
            <span>Edit</span>
          </Link>
        )}
      </div>
      <p className="mb-6 text-sm text-gray-600">{description}</p>

      <div className="space-y-4">
        {Object.entries(info).map(([key, value]) => (
          <div key={key} className="flex justify-between gap-6">
            <span className="text-gray-600">{key}</span>
            <span className="font-medium text-gray-900">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserInfoCard
