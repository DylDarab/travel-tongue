import type React from 'react'

interface Props {
  title: string
  subtitle: string
  icon: React.ReactNode
}

const FeatureCard: React.FC<Props> = ({ title, subtitle, icon }) => {
  return (
    <div className="flex w-full items-center gap-3 rounded-3xl border border-gray-200 bg-white p-4">
      <div className="rounded-full border border-gray-100 bg-teal-50 p-4 text-teal-500">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-md text-gray-500">{subtitle}</p>
      </div>
    </div>
  )
}

export default FeatureCard
