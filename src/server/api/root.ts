import { usersRouter } from '@/server/api/routers/users'
import { scenariosRouter } from '@/server/api/routers/scenarios'
import { phrasesRouter } from '@/server/api/routers/phrases'
import { conversationRouter } from '@/server/api/routers/conversation'
import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  users: usersRouter,
  scenarios: scenariosRouter,
  phrases: phrasesRouter,
  conversations: conversationRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
