import { relations, sql } from 'drizzle-orm'
import {
  index,
  jsonb,
  pgTableCreator,
  primaryKey,
  timestamp,
} from 'drizzle-orm/pg-core'
import { type AdapterAccount } from 'next-auth/adapters'
import { genderEnum } from './enums'

export const createTable = pgTableCreator((name) => `tt_${name}`)

export const users = createTable(
  'users',
  (d) => ({
    id: d
      .uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: d.varchar({ length: 255 }),
    email: d.varchar({ length: 255 }),
    emailVerified: d.timestamp('email_verified', {
      mode: 'date',
      withTimezone: true,
    }),
    image: d.varchar({ length: 1024 }),

    displayName: d.text('display_name'),
    realName: d.text('real_name'),
    gender: genderEnum('gender'),
    preferredLanguage: d.varchar('preferred_language', { length: 16 }),
    travelPreferences: d
      .text('travel_preferences')
      .array()
      .default(sql`'{}'::text[]`),
    foodAllergies: d.text('food_allergies'),
    religion: d.text('religion'),
    personalNotes: d.text('personal_notes'),

    settings: jsonb()
      .default(sql`'{}'::jsonb`)
      .notNull(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
      () => sql`now()`,
    ),
  }),
  (t) => [
    index('users_email_idx').on(t.email),
    index('users_display_name_idx').on(t.displayName),
  ],
)

export const accounts = createTable(
  'account',
  (d) => ({
    userId: d.uuid().notNull(),
    type: d.varchar({ length: 255 }).$type<AdapterAccount['type']>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index('account_user_id_idx').on(t.userId),
  ],
)

export const sessions = createTable(
  'session',
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d.uuid().notNull(),
    expires: d.timestamp({ mode: 'date', withTimezone: true }).notNull(),
  }),
  (t) => [index('t_user_id_idx').on(t.userId)],
)

export const verificationTokens = createTable(
  'verification_token',
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: 'date', withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
)

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))
