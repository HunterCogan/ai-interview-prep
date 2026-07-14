import { useState } from 'react'
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

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardDescription>
          Question {questionNumber} of {totalQuestions}
        </CardDescription>
        <CardTitle className="text-lg">{question}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Textarea
          rows={8}
          placeholder="Type your answer here…"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={loading}
        />

        <Button disabled={loading || !answer.trim()} onClick={() => onSubmitAnswer(answer.trim())}>
          {loading ? 'Getting feedback…' : 'Submit answer'}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}

export default QuestionCard
