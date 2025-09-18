import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { z } from 'zod'
import {
  createConversation,
  addMessage,
  generateReplies,
  getHistory,
} from '../services/conversationService'
import { translateText } from '../services/llmService'

export const conversationRouter = createTRPCRouter({
  /**
   * Creates a new conversation session
   * @access Protected - requires authentication
   */
  createConversation: protectedProcedure
    .input(
      z.object({
        targetLanguage: z.string().min(2).max(10),
        scenarioId: z.string().uuid().optional(),
      }),
    )
    .output(
      z.object({
        id: z.string().uuid(),
        targetLanguage: z.string(),
        scenarioId: z.string().uuid().nullable(),
        scenarioTitle: z.string(),
        scenarioContext: z.string().nullable(),
        createdAt: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await createConversation(ctx.session.user.id, input)

      if (!result) {
        throw new Error('Failed to create conversation')
      }

      return {
        id: result.id,
        targetLanguage: result.targetLang,
        scenarioId: result.scenarioId,
        scenarioTitle: result.scenarioTitle,
        scenarioContext: result.scenarioContext,
        createdAt: result.startedAt,
      }
    }),

  /**
   * Adds a new message to an existing conversation
   * @access Protected - requires authentication
   */
  addMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        text: z.string().min(1),
        isUserMessage: z.boolean(),
        language: z.string().optional(),
      }),
    )
    .output(
      z.object({
        id: z.string().uuid(),
        text: z.string(),
        translatedText: z.string(),
        isUserMessage: z.boolean(),
        language: z.string().nullable(),
        createdAt: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await addMessage(ctx.session.user.id, input)

      return {
        id: result.id,
        text: result.text,
        translatedText: result.translatedText,
        isUserMessage: result.isUserMessage,
        language: result.language ?? null,
        createdAt: result.createdAt,
      }
    }),

  /**
   * Generates exactly 6 suggested replies based on conversation context
   * @access Protected - requires authentication
   */
  generateReplies: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
      }),
    )
    .output(z.array(z.string()).length(6))
    .query(async ({ ctx, input }) => {
      return await generateReplies(ctx.session.user.id, input.conversationId)
    }),

  /**
   * Retrieves conversation history (for export only)
   * @access Protected - requires authentication
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
      }),
    )
    .output(
      z.array(
        z.object({
          id: z.string().uuid(),
          targetLanguage: z.string(),
          scenarioTitle: z.string(),
          scenarioContext: z.string().nullable(),
          createdAt: z.date(),
          messages: z.array(
            z.object({
              id: z.string().uuid(),
              text: z.string(),
              translatedText: z.string(),
              isUserMessage: z.boolean(),
              language: z.string().nullable(),
              createdAt: z.date(),
            }),
          ),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      const result = await getHistory(ctx.session.user.id, input.limit)

      return result.map((conv) => ({
        id: conv.id,
        targetLanguage: conv.targetLanguage,
        scenarioTitle: conv.scenarioTitle,
        scenarioContext: conv.scenarioContext,
        createdAt: conv.createdAt,
        messages: conv.messages.map((msg) => ({
          id: msg.id,
          text: msg.text,
          translatedText: msg.translatedText,
          isUserMessage: msg.isUserMessage,
          language: msg.language ?? null,
          createdAt: msg.timestamp,
        })),
      }))
    }),

  /**
   * Translates text to a target language
   * @access Protected - requires authentication
   */
  translateText: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1),
        targetLanguage: z.string().min(2).max(10),
      }),
    )
    .output(
      z.object({
        translatedText: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const translatedText = await translateText(
        input.text,
        input.targetLanguage,
      )

      if (!translatedText) {
        throw new Error('Failed to translate text')
      }

      return {
        translatedText,
      }
    }),
})
