import { useState } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useMicLevel } from '@/hooks/useMicLevel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface QuestionCardProps {
  question: string
  questionNumber: number
  totalQuestions: number
  loading: boolean
  error: string | null
  onSubmitAnswer: (answer: string) => void
}

function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  loading,
  error,
  onSubmitAnswer,
}: QuestionCardProps) {
  const [answer, setAnswer] = useState('')
  const {
    isSupported: micSupported,
    isListening,
    interimTranscript,
    error: micError,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    onFinalTranscript: (transcript) => {
      setAnswer((current) => (current ? `${current} ${transcript}` : transcript))
    },
  })
  const micLevel = useMicLevel(isListening)

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardDescription>
          Question {questionNumber} of {totalQuestions}
        </CardDescription>
        <CardTitle className="text-lg">{question}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {isListening ? (
              <span className="flex items-center gap-2 text-destructive">
                <span
                  className="size-2 rounded-full bg-destructive transition-transform duration-75"
                  style={{ transform: `scale(${1 + micLevel * 2.5})` }}
                />
                Listening… (mic level: {Math.round(micLevel * 100)}%)
              </span>
            ) : (
              'Type your answer, or use the microphone'
            )}
          </span>

          {micSupported && (
            <Button
              type="button"
              size="icon-sm"
              variant={isListening ? 'default' : 'outline'}
              disabled={loading}
              onClick={() => (isListening ? stopListening() : startListening())}
              aria-label={isListening ? 'Stop recording' : 'Start recording'}
            >
              {isListening ? <MicOff /> : <Mic />}
            </Button>
          )}
        </div>

        <Textarea
          rows={8}
          placeholder="Type your answer here…"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={loading}
        />

        {isListening && (
          <p className="text-sm text-muted-foreground italic">
            {interimTranscript || 'Listening for speech…'}
          </p>
        )}

        {micError && <p className="text-sm text-destructive">{micError}</p>}

        <Button disabled={loading || !answer.trim()} onClick={() => onSubmitAnswer(answer.trim())}>
          {loading ? 'Getting feedback…' : 'Submit answer'}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}

export default QuestionCard
