import type {
  FeedbackRequest,
  FeedbackResponse,
  QuestionsRequest,
  QuestionsResponse,
} from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Request to ${path} failed (${res.status}): ${detail}`)
  }
  return res.json() as Promise<TResponse>
}

export function fetchQuestions(req: QuestionsRequest): Promise<QuestionsResponse> {
  return postJson<QuestionsResponse>('/api/questions', req)
}

export function fetchFeedback(req: FeedbackRequest): Promise<FeedbackResponse> {
  return postJson<FeedbackResponse>('/api/feedback', req)
}
