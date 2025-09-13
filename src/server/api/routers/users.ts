import { userUpdateSchema } from '@/lib/schemas/user'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { users } from '@/server/db/schema/auth'
import { eq } from 'drizzle-orm'
import { updateUserProfile } from '../repositories/userRepo'

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

  updateUserProfile: protectedProcedure
    .input(userUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      return await updateUserProfile(id!, data)
    }),
})
