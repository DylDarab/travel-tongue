import { relations, sql } from 'drizzle-orm'
import { index, jsonb, pgTableCreator, timestamp } from 'drizzle-orm/pg-core'
import { accounts, users } from './auth'

export type MessageRole = 'user' | 'local' | 'system'

export interface Message {
  id: string
  role: MessageRole
  messageLang: string
  translatedText: string
  localDialogue: string
  timestamp: Date
  meta?: Record<string, unknown>
}

export const createTable = pgTableCreator((name) => `tt_${name}`)

export const scenarios = createTable(
  'scenarios',
  (d) => ({
    id: d
      .uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: d
      .uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: d.text().notNull(),
    context: d.text(),
    targetLang: d.varchar('target_lang', { length: 16 }).notNull(),
    tags: d
      .text()
      .array()
      .default(sql`'{}'::text[]`),
    pinned: d.boolean().default(false).notNull(),
    version: d.integer().default(1).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
      () => sql`now()`,
    ),
  }),
  (t) => [
    index('scenarios_user_updated_idx').on(t.userId, t.updatedAt),
    index('scenarios_target_lang_idx').on(t.targetLang),
    index('scenarios_pinned_idx').on(t.pinned),
  ],
)

export const phrases = createTable(
  'phrases',
  (d) => ({
    id: d
      .uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    scenarioId: d
      .uuid('scenario_id')
      .notNull()
      .references(() => scenarios.id, { onDelete: 'cascade' }),
    order: d.integer('order').default(0).notNull(),
    group: d.text('group'),
    label: d.text().notNull(),
    localDialogue: d.text('local_dialogue').notNull(),
    targetDialogue: d.text('target_dialogue').notNull(),
  }),
  (t) => [index('phrases_scenario_order_idx').on(t.scenarioId, t.order)],
)

export const conversations = createTable(
  'conversations',
  (d) => ({
    id: d
      .uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: d
      .uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    targetLang: d.varchar('target_lang', { length: 16 }).notNull(),
    scenarioSnapshot: jsonb('scenario_snapshot'),
    messages: jsonb('messages')
      .$type<Message[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),

    startedAt: timestamp('started_at', { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    version: d.integer().default(1).notNull(),
  }),
  (t) => [
    index('conversations_user_started_idx').on(t.userId, t.startedAt),
    index('conversations_target_lang_idx').on(t.targetLang),
  ],
)

export const scenariosRelations = relations(scenarios, ({ one, many }) => ({
  user: one(users, { fields: [scenarios.userId], references: [users.id] }),
  phrases: many(phrases),
}))

export const phrasesRelations = relations(phrases, ({ one }) => ({
  scenario: one(scenarios, {
    fields: [phrases.scenarioId],
    references: [scenarios.id],
  }),
}))

export const conversationsRelations = relations(conversations, ({ one }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  scenarios: many(scenarios),
  conversations: many(conversations),
  accounts: many(accounts),
}))
