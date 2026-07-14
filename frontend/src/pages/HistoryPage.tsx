import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/AuthProvider'
import { deleteInterview, listInterviews } from '@/lib/interviews'
import type { InterviewSummary } from '@/lib/interviews'
import { scoreBadgeVariant } from '@/lib/score'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import ScoreTrendChart from '@/components/ScoreTrendChart'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

interface HistoryCardProps {
  interview: InterviewSummary
  onDeleted: (id: string) => void
}

function HistoryCard({ interview, onDeleted }: HistoryCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleConfirmDelete() {
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteInterview(interview.id)
      onDeleted(interview.id)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete.')
      setDeleting(false)
    }
  }

  return (
    <Card>
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
          <div className="flex gap-2">
            <Button size="sm" variant="outline" render={<Link to={`/history/${interview.id}`} />}>
              <Eye />
              View
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => setConfirmOpen(true)}
              aria-label="Delete interview"
            >
              <Trash2 />
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      {deleteError && (
        <CardContent>
          <p className="text-sm text-destructive">{deleteError}</p>
        </CardContent>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this interview?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes "{interview.role} — {interview.difficulty}" and all of its
              questions, answers, and feedback. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={handleConfirmDelete}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
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

  function handleDeleted(id: string) {
    setInterviews((current) => current.filter((interview) => interview.id !== id))
  }

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

      <ScoreTrendChart interviews={interviews} />

      <div className="flex w-full max-w-lg flex-col gap-3">
        {interviews.map((interview) => (
          <HistoryCard key={interview.id} interview={interview} onDeleted={handleDeleted} />
        ))}
      </div>
    </main>
  )
}

export default HistoryPage
