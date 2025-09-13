import { users } from './../../db/schema/auth'

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { eq } from 'drizzle-orm'

export const usersRouter = createTRPCRouter({
  getUserProfile: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user) {
      return undefined
    }

    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
    })

    return user
  }),
})
