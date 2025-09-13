import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { z } from 'zod'
import {
  createScenario,
  deleteScenarioById,
  getScenarioById,
  getScenarioPhrases,
  getScenariosList,
} from '../services/scenarioService'

const createScenarioSchema = z.object({
  title: z.string().min(1).max(100),
  context: z.string().min(1).max(500),
  targetLang: z.string().min(2).max(16),
  tags: z.array(z.string()).optional().default([]),
  pinned: z.boolean().optional().default(false),
})

export const scenariosRouter = createTRPCRouter({
  getScenarios: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user) {
      return []
    }
    return await getScenariosList(ctx.session.user.id)
  }),

  getScenario: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      return await getScenarioById(input.id)
    }),

  createScenario: protectedProcedure
    .input(createScenarioSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user) {
        throw new Error('Unauthorized')
      }
      return await createScenario({
        ...input,
        userId: ctx.session.user.id,
      })
    }),

  deleteScenario: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await deleteScenarioById(input.id)
    }),

  getScenarioPhrases: protectedProcedure
    .input(z.object({ scenarioId: z.string().uuid() }))
    .query(async ({ input }) => {
      return await getScenarioPhrases(input.scenarioId)
    }),
})
