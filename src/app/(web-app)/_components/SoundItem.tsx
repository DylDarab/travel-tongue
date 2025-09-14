import { Play } from 'lucide-react'

type SoundItemProps = {
  sound: {
    id: number
    name: string
    duration: string
    category: string
  }
}

export function SoundItem({ sound }: SoundItemProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">{sound.name}</h3>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{sound.category}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{sound.duration}</span>
          <button className="text-teal-500 hover:text-teal-600">
            <Play className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}