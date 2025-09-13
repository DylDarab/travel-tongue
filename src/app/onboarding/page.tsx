import OnboardingForm from './_components/OnboardingForm'

export default async function OnboardingPage() {
  return (
    <div className="px-4 py-6">
      <h1 className="p-4 text-xl font-bold">Setup</h1>
      <hr className="text-gray-300" />
      <div className="mt-4" />
      <OnboardingForm />
    </div>
  )
}
