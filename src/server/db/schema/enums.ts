import { pgEnum } from 'drizzle-orm/pg-core'

export const genderEnum = pgEnum('gender', [
  'male',
  'female',
  'nonbinary',
  'prefer_not_to_say',
])

export const messageRoleEnum = pgEnum('message_role', [
  'user',
  'local',
  'system',
])

export const messageSourceEnum = pgEnum('message_source', [
  'speech',
  'tap',
  'llm',
  'tts',
])
