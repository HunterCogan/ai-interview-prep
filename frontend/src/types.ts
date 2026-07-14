export interface QuestionsRequest {
  role: string
  difficulty: string
  count?: number
}

export interface QuestionsResponse {
  questions: string[]
}

export interface FeedbackRequest {
  question: string
  answer: string
}

export interface FeedbackResponse {
  feedback: string
}
