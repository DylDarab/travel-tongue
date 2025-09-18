import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { api } from '@/trpc/react'

interface ChatFlowState {
  conversationId: string | null
  isInitializing: boolean
  isSending: boolean
  error: string | null
  scenarioId: string | null
}

interface UseChatFlowReturn {
  state: ChatFlowState
  initializeConversation: () => Promise<void>
  sendMessage: (text: string, language?: string) => Promise<void>
  startConversationWithPhrase: (
    japanesePhrase: string,
    englishTranslation: string,
  ) => Promise<void>
}

export const useChatFlow = (): UseChatFlowReturn => {
  const searchParams = useSearchParams()
  const scenarioId = searchParams.get('scenarioId')

  const [state, setState] = useState<ChatFlowState>({
    conversationId: null,
    isInitializing: false,
    isSending: false,
    error: null,
    scenarioId,
  })

  // tRPC hooks
  const createConversation = api.conversations.createConversation.useMutation()
  const addMessage = api.conversations.addMessage.useMutation()
  const generateReplies = api.conversations.generateReplies.useQuery(
    { conversationId: state.conversationId ?? '' },
    { enabled: false },
  )

  const initializeConversation = useCallback(async () => {
    if (state.isInitializing) return

    setState((prev) => ({ ...prev, isInitializing: true, error: null }))

    try {
      const response = await createConversation.mutateAsync({
        targetLanguage: 'ja',
        scenarioId: scenarioId ?? undefined,
      })

      setState((prev) => ({
        ...prev,
        conversationId: response.id,
        isInitializing: false,
      }))
    } catch (error) {
      console.error('Failed to create conversation:', error)
      setState((prev) => ({
        ...prev,
        isInitializing: false,
        error: 'Failed to initialize conversation',
      }))
    }
  }, [createConversation, scenarioId, state.isInitializing])

  const sendMessage = useCallback(
    async (text: string, language?: string) => {
      if (!state.conversationId || state.isSending) return

      setState((prev) => ({ ...prev, isSending: true, error: null }))

      try {
        await addMessage.mutateAsync({
          conversationId: state.conversationId,
          text,
          isUserMessage: true,
          language,
        })

        // Get reply options
        await generateReplies.refetch()
        setState((prev) => ({ ...prev, isSending: false }))
      } catch (error) {
        console.error('Failed to send message:', error)
        setState((prev) => ({
          ...prev,
          isSending: false,
          error: 'Failed to send message',
        }))
      }
    },
    [addMessage, generateReplies, state.conversationId, state.isSending],
  )

  const startConversationWithPhrase = useCallback(
    async (japanesePhrase: string, _englishTranslation: string) => {
      if (!state.conversationId) return

      setState((prev) => ({ ...prev, isSending: true, error: null }))

      try {
        // Send the Japanese phrase as the first message
        await addMessage.mutateAsync({
          conversationId: state.conversationId,
          text: japanesePhrase,
          isUserMessage: true,
          language: 'ja',
        })

        // Get reply options
        await generateReplies.refetch()
        setState((prev) => ({ ...prev, isSending: false }))
      } catch (error) {
        console.error('Failed to start conversation with phrase:', error)
        setState((prev) => ({
          ...prev,
          isSending: false,
          error: 'Failed to start conversation',
        }))
      }
    },
    [addMessage, generateReplies, state.conversationId],
  )

  // Initialize conversation on mount if not already initialized
  useEffect(() => {
    if (!state.conversationId && !state.isInitializing) {
      void initializeConversation()
    }
  }, [state.conversationId, state.isInitializing, initializeConversation])

  return {
    state,
    initializeConversation,
    sendMessage,
    startConversationWithPhrase,
  }
}
