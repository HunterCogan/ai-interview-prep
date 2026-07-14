import ReactMarkdown from 'react-markdown'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface FeedbackCardProps {
  question: string
  feedback: string
  score: number
  isLastQuestion: boolean
  onNext: () => void
}

function scoreBadgeVariant(score: number) {
  if (score >= 8) return 'default'
  if (score >= 5) return 'secondary'
  return 'destructive'
}

function FeedbackCard({ question, feedback, score, isLastQuestion, onNext }: FeedbackCardProps) {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardDescription>Feedback</CardDescription>
        <CardTitle className="text-lg">{question}</CardTitle>
        <CardAction>
          <Badge variant={scoreBadgeVariant(score)}>{score}/10</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg bg-muted p-4 text-foreground">
          <ReactMarkdown>{feedback}</ReactMarkdown>
        </div>

        <Button onClick={onNext}>{isLastQuestion ? 'Finish' : 'Next question'}</Button>
      </CardContent>
    </Card>
  )
}

export default FeedbackCard
