export const OnboardingSteps = [
  'personalInfo',
  'travelPreferences',
  'additionalContext',
] as const

export type OnboardingStep = (typeof OnboardingSteps)[number]
