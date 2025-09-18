// Define all types directly in this file to avoid import issues
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly length: number
  readonly isFinal: boolean
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number

  start: () => void
  stop: () => void

  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
    | null
  onend: (() => void) | null
}

export class SpeechService {
  private recognition: SpeechRecognition | null = null
  private isListening = false
  private timeoutId: NodeJS.Timeout | null = null
  private readonly sessionTimeout = 10 * 60 * 1000 // 10 minutes

  constructor() {
    this.initializeRecognition()
  }

  private initializeRecognition() {
    const SpeechRecognitionConstructor =
      typeof window !== 'undefined'
        ? (window.SpeechRecognition ?? window.webkitSpeechRecognition)
        : null

    if (SpeechRecognitionConstructor) {
      this.recognition =
        new SpeechRecognitionConstructor() as unknown as SpeechRecognition
      this.recognition.continuous = true
      this.recognition.interimResults = true
      this.recognition.lang = 'ja-JP'
      this.recognition.maxAlternatives = 1

      this.recognition.onresult = this.handleResult.bind(this)
      this.recognition.onerror = this.handleError.bind(this)
      this.recognition.onend = this.handleEnd.bind(this)
    }
  }

  private handleResult(event: SpeechRecognitionEvent) {
    if (!this.isListening) return

    const results = event.results
    if (results.length > 0) {
      const result = results[results.length - 1]
      if (result?.isFinal) {
        const transcript = result[0]?.transcript.trim()
        if (transcript) {
          this.onFinalResult(transcript)
          this.resetTimeout()
        }
      } else if (result) {
        const transcript = Array.from(results)
          .map((result) => result[0]?.transcript ?? '')
          .join('')
        this.onInterimResult(transcript)
      }
    }
  }

  private handleError(event: SpeechRecognitionErrorEvent) {
    this.onSpeechError(event.error)
    this.stopListening()
  }

  private handleEnd() {
    if (this.isListening) {
      this.restartListening()
    }
  }

  private resetTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }

    this.timeoutId = setTimeout(() => {
      this.stopListening()
      this.onTimeout()
    }, this.sessionTimeout)
  }

  private restartListening() {
    if (this.isListening && this.recognition) {
      try {
        this.recognition.start()
      } catch (error) {
        console.warn('Failed to restart speech recognition:', error)
      }
    }
  }

  // Callbacks to be implemented by the consumer
  onFinalResult(_transcript: string) {
    // Implementation will be provided by consumer
  }

  onInterimResult(_transcript: string) {
    // Implementation will be provided by consumer
  }

  onSpeechError(_error: string) {
    // Implementation will be provided by consumer
  }

  onTimeout() {
    // Implementation will be provided by consumer
  }

  isSupported(): boolean {
    return this.recognition !== null
  }

  startListening() {
    if (!this.recognition) {
      this.onSpeechError('Speech recognition not supported')
      return
    }

    if (this.isListening) return

    try {
      this.recognition.start()
      this.isListening = true
      this.resetTimeout()
    } catch (error) {
      this.onSpeechError(
        `Failed to start speech recognition: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  stopListening() {
    if (!this.recognition || !this.isListening) return

    try {
      this.recognition.stop()
      this.isListening = false

      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
        this.timeoutId = null
      }
    } catch (error) {
      console.warn('Error stopping speech recognition:', error)
    }
  }

  setOnFinalResult(callback: (transcript: string) => void) {
    this.onFinalResult = callback
  }

  setOnInterimResult(callback: (transcript: string) => void) {
    this.onInterimResult = callback
  }

  setOnSpeechError(callback: (error: string) => void) {
    this.onSpeechError = callback
  }

  setOnTimeout(callback: () => void) {
    this.onTimeout = callback
  }

  destroy() {
    this.stopListening()
    if (this.recognition) {
      this.recognition.onresult = null
      this.recognition.onerror = null
      this.recognition.onend = null
      this.recognition = null
    }
  }
}
