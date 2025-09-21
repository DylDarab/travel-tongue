export type TurnState = 'idle' | 'speaking_user' | 'listening_local' | 'processing_llm' | 'error'
export type Events =
  | { type: 'TTS_START' }
  | { type: 'TTS_END' }
  | { type: 'DG_FINAL'; text: string }
  | { type: 'SILENCE_TIMEOUT' }
  | { type: 'MAX_UTTER' }
  | { type: 'RESET' }
  | { type: 'ERROR' }

export function nextState(state: TurnState, event: Events): TurnState {
  switch (state) {
    case 'idle':
      if (event.type === 'TTS_START') return 'speaking_user'
      if (event.type === 'ERROR') return 'error'
      return state
    case 'speaking_user':
      if (event.type === 'TTS_END') return 'listening_local'
      if (event.type === 'ERROR') return 'error'
      return state
    case 'listening_local':
      if (
        event.type === 'DG_FINAL' ||
        event.type === 'SILENCE_TIMEOUT' ||
        event.type === 'MAX_UTTER'
      ) {
        return 'processing_llm'
      }
      if (event.type === 'ERROR') return 'error'
      return state
    case 'processing_llm':
      if (event.type === 'TTS_START') return 'speaking_user'
      if (event.type === 'RESET') return 'idle'
      if (event.type === 'ERROR') return 'error'
      return state
    case 'error':
      if (event.type === 'RESET') return 'idle'
      return state
    default:
      return state
  }
}
