import { useState } from 'react'
import { fetchFeedback, fetchQuestions } from '@/api'
import SetupForm from '@/components/SetupForm'
import QuestionCard from '@/components/QuestionCard'
import FeedbackCard from '@/components/FeedbackCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'

type Stage = 'setup' | 'question' | 'feedback' | 'done'

function HomePage() {
  const [stage, setStage] = useState<Stage>('setup')
  const [questions, setQuestions] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [score, setScore] = useState<number | null>(null)

  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [questionsError, setQuestionsError] = useState<string | null>(null)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  async function handleStart(role: string, difficulty: string) {
    setLoadingQuestions(true)
    setQuestionsError(null)
    try {
      const res = await fetchQuestions({ role, difficulty })
      setQuestions(res.questions)
      setCurrentIndex(0)
      setStage('question')
    } catch (err) {
      setQuestionsError(err instanceof Error ? err.message : 'Failed to generate questions.')
    } finally {
      setLoadingQuestions(false)
    }
  }

  async function handleSubmitAnswer(answer: string) {
    setLoadingFeedback(true)
    setFeedbackError(null)
    try {
      const res = await fetchFeedback({ question: questions[currentIndex], answer })
      setFeedback(res.feedback)
      setScore(res.score)
      setStage('feedback')
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : 'Failed to get feedback.')
    } finally {
      setLoadingFeedback(false)
    }
  }

  function handleNext() {
    setFeedback(null)
    setScore(null)
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1)
      setStage('question')
    } else {
      setStage('done')
    }
  }

  function handleRestart() {
    setQuestions([])
    setCurrentIndex(0)
    setFeedback(null)
    setScore(null)
    setQuestionsError(null)
    setFeedbackError(null)
    setStage('setup')
  }

  return (
    <main className="flex grow flex-col items-center justify-center gap-6 p-8">
      {stage === 'setup' && (
        <SetupForm loading={loadingQuestions} error={questionsError} onSubmit={handleStart} />
      )}

      {stage === 'question' && (
        <QuestionCard
          question={questions[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          loading={loadingFeedback}
          error={feedbackError}
          onSubmitAnswer={handleSubmitAnswer}
        />
      )}

      {stage === 'feedback' && feedback && score !== null && (
        <FeedbackCard
          question={questions[currentIndex]}
          feedback={feedback}
          score={score}
          isLastQuestion={currentIndex + 1 >= questions.length}
          onNext={handleNext}
        />
      )}

      {stage === 'done' && (
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <CardTitle className="text-lg">Nice work — you've finished this set.</CardTitle>
            <Button onClick={handleRestart}>Start over</Button>
          </CardContent>
        </Card>
      )}
    </main>
  )
}

export default HomePage
