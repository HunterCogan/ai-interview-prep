import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { useAuth } from '@/lib/AuthProvider'
import { listInterviews } from '@/lib/interviews'
import type { InterviewSummary } from '@/lib/interviews'
import { scoreBadgeVariant } from '@/lib/score'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function HistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const [interviews, setInterviews] = useState<InterviewSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount loading state
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    listInterviews(user.id)
      .then(setInterviews)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load history.'))
      .finally(() => setLoading(false))
  }, [user])

  if (authLoading || loading) {
    return (
      <main className="flex grow flex-col items-center justify-center p-8">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="flex grow flex-col items-center justify-center gap-2 p-8 text-center">
        <h1 className="font-heading text-2xl font-medium">Interview History</h1>
        <p className="text-muted-foreground">Sign in to save and view your past interviews.</p>
      </main>
    )
  }

  return (
    <main className="flex grow flex-col items-center gap-6 p-8">
      <h1 className="font-heading text-2xl font-medium">Interview History</h1>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!error && interviews.length === 0 && (
        <p className="text-muted-foreground">You haven't completed any interviews yet.</p>
      )}

      <div className="flex w-full max-w-lg flex-col gap-3">
        {interviews.map((interview) => (
          <Card key={interview.id}>
            <CardHeader>
              <CardDescription>
                {formatDate(interview.createdAt)} · {interview.questionCount} question
                {interview.questionCount === 1 ? '' : 's'}
              </CardDescription>
              <CardTitle className="text-lg capitalize">
                {interview.role} — {interview.difficulty}
              </CardTitle>
              <CardAction className="flex flex-col items-end gap-2">
                {interview.averageScore !== null && (
                  <Badge variant={scoreBadgeVariant(interview.averageScore)}>
                    {interview.averageScore.toFixed(1)}/10
                  </Badge>
                )}
                <Button size="sm" variant="outline" render={<Link to={`/history/${interview.id}`} />}>
                  <Eye />
                  View
                </Button>
              </CardAction>
            </CardHeader>
          </Card>
        ))}
      </div>
    </main>
  )
}

export default HistoryPage
