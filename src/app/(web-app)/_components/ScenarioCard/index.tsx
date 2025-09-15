import { Star } from 'lucide-react'

interface ScenarioCardProps {
  title: string
  description: string
  language: string
  phrasesAmount: number
}

const ScenarioCard = ({
  title,
  description,
  language,
  phrasesAmount,
}: ScenarioCardProps) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="mb-1 font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <button className="min-h-[48px] min-w-[48px] touch-manipulation rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-yellow-500">
          <Star className="h-6 w-6" />
        </button>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span className="rounded-full bg-gray-100 px-2 py-1">{language}</span>
        <span>{phrasesAmount} phrases</span>
      </div>
    </div>
  )
}

export default ScenarioCard
