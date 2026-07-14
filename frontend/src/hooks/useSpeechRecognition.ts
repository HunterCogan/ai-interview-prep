import { useCallback, useEffect, useRef, useState } from 'react'

interface UseSpeechRecognitionOptions {
  onFinalTranscript: (transcript: string) => void
}

interface UseSpeechRecognitionResult {
  isSupported: boolean
  isListening: boolean
  interimTranscript: string
  error: string | null
  startListening: () => void
  stopListening: () => void
}

const SpeechRecognitionClass: typeof SpeechRecognition | undefined =
  typeof window !== 'undefined'
    ? window.SpeechRecognition ?? window.webkitSpeechRecognition
    : undefined

export function useSpeechRecognition({
  onFinalTranscript,
}: UseSpeechRecognitionOptions): UseSpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const interimRef = useRef('')

  const onFinalTranscriptRef = useRef(onFinalTranscript)
  useEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript
  }, [onFinalTranscript])

  useEffect(() => {
    if (!SpeechRecognitionClass) return

    const recognition = new SpeechRecognitionClass()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          onFinalTranscriptRef.current(result[0].transcript.trim())
        } else {
          interim += result[0].transcript
        }
      }
      interimRef.current = interim
      setInterimTranscript(interim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        setError(
          event.error === 'not-allowed'
            ? 'Microphone access was denied.'
            : 'No microphone was found.',
        )
      }
    }

    recognition.onend = () => {
      // Chrome doesn't always finalize the last utterance before ending the
      // session (whether stopped manually or after a silence timeout), so
      // commit whatever interim text was last heard rather than losing it.
      if (interimRef.current.trim()) {
        onFinalTranscriptRef.current(interimRef.current.trim())
      }
      interimRef.current = ''
      setInterimTranscript('')
      setIsListening(false)
    }

    recognitionRef.current = recognition
    return () => {
      recognition.stop()
      recognitionRef.current = null
    }
  }, [])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    setError(null)
    recognitionRef.current.start()
    setIsListening(true)
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  return {
    isSupported: !!SpeechRecognitionClass,
    isListening,
    interimTranscript,
    error,
    startListening,
    stopListening,
  }
}
