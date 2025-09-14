import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import PhraseCard from '@/app/(web-app)/_components/PhraseCard'
import { TopBar } from '@/app/_components/TopBar'

const ScenarioDetailPage = () => {
  // Sample data based on the UI image
  const scenarioData = [
    {
      id: 'greetings',
      title: 'Greetings',
      phrases: [
        {
          id: 'hello',
          english: 'Hello',
          translation: 'こんにちは',
          speakLang: 'ja-JP',
        },
        {
          id: 'good-evening',
          english: 'Good evening',
          translation: 'こんばんは',
          speakLang: 'ja-JP',
        },
        {
          id: 'thank-you',
          english: 'Thank you',
          translation: 'ありがとうございます',
          speakLang: 'ja-JP',
        },
      ],
    },
    {
      id: 'ordering',
      title: 'Ordering',
      phrases: [
        {
          id: 'table-for-three',
          english: 'Table for three',
          translation: '3名様でお願いします',
          speakLang: 'ja-JP',
        },
        {
          id: 'menu-please',
          english: 'Menu please',
          translation: 'メニューを見せてください',
          speakLang: 'ja-JP',
        },
        {
          id: 'chefs-choice',
          english: "Chef's choice",
          translation: 'おまかせでお願いします',
          speakLang: 'ja-JP',
        },
        {
          id: 'no-wasabi',
          english: 'No wasabi',
          translation: 'わさび抜きでお願いします',
          speakLang: 'ja-JP',
        },
        {
          id: 'check-please',
          english: 'Check please',
          translation: 'お会計をお願いします',
          speakLang: 'ja-JP',
        },
      ],
    },
    {
      id: 'etiquette',
      title: 'Etiquette',
      phrases: [
        { id: 'excuse-me', english: 'Excuse me', translation: 'すみません' },
        {
          id: 'im-sorry',
          english: "I'm sorry",
          translation: '申し訳ございません',
          speakLang: 'ja-JP',
        },
        {
          id: 'it-was-delicious',
          english: 'It was delicious',
          translation: '美味しかったです',
          speakLang: 'ja-JP',
        },
      ],
    },
  ]

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <TopBar
        title="Sushi restaurant"
        description="3 friends, ¥5000 budget each"
        backButton={true}
      />
      <div className="p-4 pt-20">
        <div className="space-y-6">
          {scenarioData.map((section) => (
            <div key={section.id} className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  {section.title} ({section.phrases.length})
                </h2>
                <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                  <span>↑</span>
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {section.phrases.map((phrase) => (
                  <PhraseCard
                    key={phrase.id}
                    english={phrase.english}
                    translation={phrase.translation}
                    speakLang={phrase.speakLang ?? 'en-US'}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ScenarioDetailPage
