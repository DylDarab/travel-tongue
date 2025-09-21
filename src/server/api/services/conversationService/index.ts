import { db } from '@/server/db'
import { conversations, scenarios } from '@/server/db/schema/app'
import { users } from '@/server/db/schema/auth'
import { eq, desc } from 'drizzle-orm'
import { generateContent } from '../llmService'
import { z } from 'zod'
import { GENERATE_ANSWER_CHOICES_PROMPT } from './prompts'

interface DbMessage {
  id: string
  role: 'user' | 'local' | 'system'
  messageLang: string
  translatedText: string
  localDialogue: string
  timestamp: Date
  meta?: Record<string, unknown>
  choices?: string[]
  selectedChoice?: string
}

interface AppMessage {
  id: string
  text: string
  translatedText: string
  isUserMessage: boolean
  language?: string
  timestamp: Date
  choices?: string[]
  selectedChoice?: string
}

const ReplySchema = z
  .array(
    z.object({
      id: z.string(),
      label: z.string(),
      localAnswer: z.string(),
      targetAnswer: z.string(),
    }),
  )
  .length(6)

export async function createConversation(
  userId: string,
  input: {
    targetLanguage: string
    scenarioId?: string
  },
) {
  // Get scenario details if provided
  let scenarioTitle = 'General Conversation'
  let scenarioContext = ''

  if (input.scenarioId) {
    const scenario = await db.query.scenarios.findFirst({
      where: eq(scenarios.id, input.scenarioId),
    })

    if (scenario) {
      scenarioTitle = scenario.title
      scenarioContext = scenario.context ?? ''
    }
  }

  const [conversation] = await db
    .insert(conversations)
    .values({
      userId,
      targetLang: input.targetLanguage,
      scenarioId: input.scenarioId ?? null,
      scenarioTitle,
      scenarioContext,
      startedAt: new Date(),
    })
    .returning()

  return conversation
}

export async function addMessage(
  userId: string,
  input: {
    conversationId: string
    text: string
    isUserMessage: boolean
    language?: string
  },
) {
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, input.conversationId),
  })

  if (!conversation || conversation.userId !== userId) {
    throw new Error('Unauthorized')
  }

  const newDbMessage: DbMessage = {
    id: crypto.randomUUID(),
    role: input.isUserMessage ? 'user' : 'local',
    messageLang: input.language ?? conversation.targetLang,
    translatedText: '',
    localDialogue: input.text,
    timestamp: new Date(),
    choices: input.isUserMessage ? [] : undefined,
    selectedChoice: undefined,
  }

  const newAppMessage: AppMessage = {
    id: newDbMessage.id,
    text: newDbMessage.localDialogue,
    translatedText: newDbMessage.translatedText,
    isUserMessage: newDbMessage.role === 'user',
    language: newDbMessage.messageLang,
    timestamp: newDbMessage.timestamp,
    choices: newDbMessage.choices,
    selectedChoice: newDbMessage.selectedChoice,
  }

  const updatedMessages = [...conversation.messages, newDbMessage]

  await db
    .update(conversations)
    .set({
      messages: updatedMessages,
    })
    .where(eq(conversations.id, input.conversationId))

  return {
    ...newAppMessage,
    createdAt: newAppMessage.timestamp,
  }
}

export async function generateReplies(
  userId: string,
  conversationId: string,
): Promise<
  Array<{
    id: string
    label: string
    localAnswer: string
    targetAnswer: string
  }>
> {
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
  })

  if (!conversation || conversation.userId !== userId) {
    throw new Error('Unauthorized')
  }

  await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  const conversationHistory = conversation.messages
    .map((msg) => ({
      role: msg.role,
      text: msg.localDialogue,
      lang: msg.messageLang,
    }))
    .slice(-10) // Get last 10 messages for context

  const prompt = GENERATE_ANSWER_CHOICES_PROMPT.replace(
    '{{conversationHistory}}',
    JSON.stringify(
      {
        scenario: conversation.scenarioContext ?? 'General conversation',
        messages: conversationHistory,
        targetLang: conversation.targetLang,
        uiLang: 'en',
      },
      null,
      2,
    ),
  )

  const replies = await generateContent(
    prompt,
    ReplySchema,
    3, // max retries
  )

  if (!replies) {
    throw new Error('Failed to generate replies')
  }

  return replies as Array<{
    id: string
    label: string
    localAnswer: string
    targetAnswer: string
  }>
}

export async function getConversationById(
  userId: string,
  conversationId: string,
) {
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
  })

  if (!conversation || conversation.userId !== userId) {
    throw new Error('Conversation not found or unauthorized')
  }

  return {
    id: conversation.id,
    targetLanguage: conversation.targetLang,
    scenarioId: conversation.scenarioId,
    scenarioTitle: conversation.scenarioTitle,
    scenarioContext: conversation.scenarioContext,
    createdAt: conversation.startedAt,
    messages: conversation.messages.map((msg) => ({
      id: msg.id,
      text: msg.localDialogue,
      translatedText: msg.translatedText,
      isUserMessage: msg.role === 'user',
      language: msg.messageLang,
      timestamp: new Date(msg.timestamp),
      choices: msg.choices,
      selectedChoice: msg.selectedChoice,
    })),
  }
}

export async function getHistory(userId: string, limit = 10) {
  const conversationsList = await db
    .select({
      id: conversations.id,
      targetLanguage: conversations.targetLang,
      scenarioTitle: conversations.scenarioTitle,
      scenarioContext: conversations.scenarioContext,
      createdAt: conversations.startedAt,
      messages: conversations.messages,
    })
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.startedAt))
    .limit(limit)

  return conversationsList.map((conv) => ({
    ...conv,
    messages: conv.messages.map((msg) => ({
      id: msg.id,
      text: msg.localDialogue,
      translatedText: msg.translatedText,
      isUserMessage: msg.role === 'user',
      language: msg.messageLang,
      timestamp: new Date(msg.timestamp),
      choices: msg.choices,
      selectedChoice: msg.selectedChoice,
    })),
  }))
}
