import { supabase } from './supabaseClient'

export async function createInterview(
  userId: string,
  role: string,
  difficulty: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('interviews')
    .insert({ user_id: userId, role, difficulty })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

interface SaveInterviewQuestionParams {
  interviewId: string
  userId: string
  questionOrder: number
  question: string
  answer: string
  feedback: string
  score: number
}

export async function saveInterviewQuestion(params: SaveInterviewQuestionParams): Promise<void> {
  const { error } = await supabase.from('interview_questions').insert({
    interview_id: params.interviewId,
    user_id: params.userId,
    question_order: params.questionOrder,
    question: params.question,
    answer: params.answer,
    feedback: params.feedback,
    score: params.score,
  })
  if (error) throw error
}

export interface InterviewSummary {
  id: string
  role: string
  difficulty: string
  createdAt: string
  questionCount: number
  averageScore: number | null
}

export async function listInterviews(userId: string): Promise<InterviewSummary[]> {
  const { data, error } = await supabase
    .from('interviews')
    .select('id, role, difficulty, created_at, interview_questions(score)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error

  return (data ?? []).map((row) => {
    const scores = row.interview_questions.map((q) => q.score)
    const averageScore = scores.length
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length
      : null
    return {
      id: row.id,
      role: row.role,
      difficulty: row.difficulty,
      createdAt: row.created_at,
      questionCount: scores.length,
      averageScore,
    }
  })
}

export async function deleteInterview(interviewId: string): Promise<void> {
  // interview_questions rows cascade-delete via the FK's ON DELETE CASCADE.
  const { error } = await supabase.from('interviews').delete().eq('id', interviewId)
  if (error) throw error
}

export interface InterviewQuestionDetail {
  id: string
  questionOrder: number
  question: string
  answer: string
  feedback: string
  score: number
}

export interface InterviewDetail {
  id: string
  role: string
  difficulty: string
  createdAt: string
  questions: InterviewQuestionDetail[]
}

export async function getInterviewDetail(interviewId: string): Promise<InterviewDetail> {
  const { data: interview, error: interviewError } = await supabase
    .from('interviews')
    .select('id, role, difficulty, created_at')
    .eq('id', interviewId)
    .single()
  if (interviewError) throw interviewError

  const { data: questions, error: questionsError } = await supabase
    .from('interview_questions')
    .select('id, question_order, question, answer, feedback, score')
    .eq('interview_id', interviewId)
    .order('question_order', { ascending: true })
  if (questionsError) throw questionsError

  return {
    id: interview.id,
    role: interview.role,
    difficulty: interview.difficulty,
    createdAt: interview.created_at,
    questions: (questions ?? []).map((q) => ({
      id: q.id,
      questionOrder: q.question_order,
      question: q.question,
      answer: q.answer,
      feedback: q.feedback,
      score: q.score,
    })),
  }
}
