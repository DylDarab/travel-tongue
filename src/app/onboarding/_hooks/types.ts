import z from 'zod'

export const OnboardingFormSchema = z.object({
  displayName: z.string().min(1),
  realName: z.string().min(1),
  gender: z.enum(['male', 'female', 'nonbinary', 'prefer_not_to_say']),
  preferredLanguage: z.string(),
  travelPreferences: z.array(z.string()),
  foodAllergies: z.string(),
  religion: z.string(),
  personalNotes: z.string(),
})

export type OnboardingFormData = z.infer<typeof OnboardingFormSchema>
