import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { getInterviewDetail } from '@/lib/interviews'
import type { InterviewDetail } from '@/lib/interviews'
import { scoreBadgeVariant } from '@/lib/score'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function InterviewDetailPage() {
  const { interviewId } = useParams<{ interviewId: string }>()
  const [interview, setInterview] = useState<InterviewDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!interviewId) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount loading state
    setLoading(true)
    setError(null)
    getInterviewDetail(interviewId)
      .then(setInterview)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load interview.'))
      .finally(() => setLoading(false))
  }, [interviewId])

  if (loading) {
    return (
      <main className="flex grow flex-col items-center justify-center p-8">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    )
  }

  if (error || !interview) {
    return (
      <main className="flex grow flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-destructive">{error ?? 'Interview not found.'}</p>
        <Link to="/history" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          Back to history
        </Link>
      </main>
    )
  }

  return (
    <main className="flex grow flex-col items-center gap-6 p-8">
      <div className="flex w-full max-w-lg flex-col gap-1">
        <Link to="/history" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          ← Back to history
        </Link>
        <h1 className="font-heading text-2xl font-medium capitalize">
          {interview.role} — {interview.difficulty}
        </h1>
        <p className="text-sm text-muted-foreground">{formatDate(interview.createdAt)}</p>
      </div>

      <div className="flex w-full max-w-lg flex-col gap-4">
        {interview.questions.map((q) => (
          <Card key={q.id}>
            <CardHeader>
              <CardDescription>Question {q.questionOrder}</CardDescription>
              <CardTitle className="text-lg">{q.question}</CardTitle>
              <CardAction>
                <Badge variant={scoreBadgeVariant(q.score)}>{q.score}/10</Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Your answer</p>
                <p>{q.answer}</p>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg bg-muted p-4 text-foreground">
                <ReactMarkdown>{q.feedback}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}

export default InterviewDetailPage
