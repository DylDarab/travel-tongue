import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import {
  generateScenarioPhrases,
  translatePhrase,
  addPhraseToScenario,
  generatePhraseFromLabel,
} from '../services/phraseService'

export const phrasesRouter = createTRPCRouter({
  generatePhrases: protectedProcedure
    .input(z.object({ scenarioId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user) {
        throw new Error('Unauthorized')
      }
      return await generateScenarioPhrases(
        input.scenarioId,
        ctx.session.user.id,
      )
    }),

  translate: protectedProcedure
    .input(
      z.object({
        englishPhrase: z.string().min(1).max(300),
        targetLang: z.string().min(2).max(16),
        context: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return await translatePhrase(
        input.englishPhrase,
        input.targetLang,
        input.context,
      )
    }),

  addPhrase: protectedProcedure
    .input(
      z.object({
        scenarioId: z.string().uuid(),
        label: z.string().min(1).max(100),
        localDialogue: z.string().min(1).max(300),
        targetDialogue: z.string().min(1).max(300),
        group: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await addPhraseToScenario(input.scenarioId, {
        label: input.label,
        localDialogue: input.localDialogue,
        targetDialogue: input.targetDialogue,
        group: input.group,
      })
    }),

  generatePhraseFromLabel: protectedProcedure
    .input(
      z.object({
        label: z.string().min(1).max(100),
        scenarioId: z.string().uuid(),
        targetLang: z.string().min(2).max(16),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user) {
        throw new Error('Unauthorized')
      }
      return await generatePhraseFromLabel(
        input.label,
        input.scenarioId,
        input.targetLang,
        ctx.session.user.id,
      )
    }),
})
