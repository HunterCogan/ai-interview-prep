import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface FeedbackCardProps {
  question: string
  feedback: string
  isLastQuestion: boolean
  onNext: () => void
}

function FeedbackCard({ question, feedback, isLastQuestion, onNext }: FeedbackCardProps) {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardDescription>Feedback</CardDescription>
        <CardTitle className="text-lg">{question}</CardTitle>
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
