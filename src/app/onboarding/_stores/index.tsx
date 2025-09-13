'use client'

import { create } from 'zustand'
import type { OnboardingStep } from '../types'

interface OnboardingStore {
  onboardingStep: OnboardingStep
  setOnboardingStep: (step: OnboardingStep) => void
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  onboardingStep: 'personalInfo',
  setOnboardingStep: (step) => set({ onboardingStep: step }),
}))
