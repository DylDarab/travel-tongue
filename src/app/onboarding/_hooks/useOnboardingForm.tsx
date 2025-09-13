import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { OnboardingFormSchema } from './types'

export const useOnboardingForm = () => {
  const methods = useForm({
    defaultValues: undefined,
    resolver: zodResolver(OnboardingFormSchema),
  })

  return methods
}
