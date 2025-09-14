import z from 'zod'

export const profileUpdateSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  realName: z.string().min(1, 'Real name is required'),
  gender: z
    .enum(['male', 'female', 'nonbinary', 'prefer_not_to_say'])
    .optional(),
  preferredLanguage: z.string().optional(),
  travelPreferences: z.array(z.string()),
  foodAllergies: z.string().optional(),
  religion: z.string().optional(),
  personalNotes: z.string().optional(),
})

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
