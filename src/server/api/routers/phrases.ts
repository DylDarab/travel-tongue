import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { generateScenarioPhrases } from '../services/phraseService'

export const phrasesRouter = createTRPCRouter({
  generatePhrases: protectedProcedure
    .input(z.object({ scenarioId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await generateScenarioPhrases(input.scenarioId)
    }),
})
