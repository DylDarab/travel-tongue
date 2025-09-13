import { User, Heart, FileText, Edit } from 'lucide-react'

export default function SettingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-20">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Settings</h1>

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-teal-600" />
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            </div>
            <button className="flex items-center space-x-1 font-medium text-teal-600 hover:text-teal-700">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
          </div>
          <p className="mb-4 text-sm text-gray-600">
            Your personal information for better conversations.
          </p>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Display name</span>
              <span className="font-medium text-gray-900">estw</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Real name</span>
              <span className="font-medium text-gray-900">ewr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Default language</span>
              <span className="font-medium text-gray-900">ja-JP</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center space-x-3">
            <Heart className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Travel preferences
            </h2>
          </div>
          <p className="mb-4 text-sm text-gray-600">
            Your travel style and dietary preferences.
          </p>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Preferences</span>
              <span className="text-gray-500">None selected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Allergies</span>
              <span className="text-gray-500">None specified</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Religion</span>
              <span className="text-gray-500">Not specified</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center space-x-3">
            <FileText className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Personal context
            </h2>
          </div>
          <p className="mb-4 text-sm text-gray-600">
            Additional information for better AI assistance.
          </p>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Notes</span>
              <span className="text-gray-500">
                No additional context provided
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
