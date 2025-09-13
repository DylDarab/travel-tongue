import { relations, sql } from 'drizzle-orm'
import { index, jsonb, pgTableCreator, timestamp } from 'drizzle-orm/pg-core'
import { messageRoleEnum, messageSourceEnum } from './enums'
import { accounts, users } from './auth'

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

export const messages = createTable(
  'messages',
  (d) => ({
    id: d
      .uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    conversationId: d
      .uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),

    role: messageRoleEnum('role').notNull(),
    lang: d.varchar({ length: 16 }).notNull(),
    text: d.text().notNull(),
    ts: timestamp('ts', { withTimezone: true })
      .default(sql`now()`)
      .notNull(),

    source: messageSourceEnum('source'),
    audioKey: d.text('audio_key'),
    meta: jsonb(),
  }),
  (t) => [index('messages_conversation_ts_idx').on(t.conversationId, t.ts)],
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

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [conversations.userId],
      references: [users.id],
    }),
    messages: many(messages),
  }),
)

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  scenarios: many(scenarios),
  conversations: many(conversations),
  accounts: many(accounts),
}))
