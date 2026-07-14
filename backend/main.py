import json
import os

from anthropic import Anthropic
from anthropic.types import Message, TextBlock
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

QUESTIONS_MODEL = "claude-haiku-4-5-20251001"
FEEDBACK_MODEL = "claude-sonnet-5"

app = FastAPI(title="AI Interview Prep API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionsRequest(BaseModel):
    role: str
    difficulty: str
    count: int = 5


class QuestionsResponse(BaseModel):
    questions: list[str]


class FeedbackRequest(BaseModel):
    question: str
    answer: str


class FeedbackResponse(BaseModel):
    feedback: str


def _first_text_block(message: Message) -> str:
    block = message.content[0]
    if not isinstance(block, TextBlock):
        raise HTTPException(status_code=502, detail=f"Unexpected response block type from model: {type(block).__name__}")
    return block.text


def _extract_json_array(raw: str) -> list[str]:
    text = raw.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[len("json"):]
        text = text.strip()
    start, end = text.find("["), text.rfind("]")
    if start != -1 and end != -1:
        text = text[start : end + 1]
    return json.loads(text)


@app.post("/api/questions", response_model=QuestionsResponse)
def generate_questions(req: QuestionsRequest) -> QuestionsResponse:
    prompt = (
        f"Generate {req.count} interview questions for a {req.difficulty} "
        f"{req.role} candidate. Return ONLY a JSON array of question strings, "
        f"with no other text before or after it."
    )
    message = client.messages.create(
        model=QUESTIONS_MODEL,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = _first_text_block(message)
    try:
        questions = _extract_json_array(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail=f"Model returned unparseable response: {raw!r}")
    return QuestionsResponse(questions=questions)


@app.post("/api/feedback", response_model=FeedbackResponse)
def generate_feedback(req: FeedbackRequest) -> FeedbackResponse:
    prompt = (
        f"Interview question: {req.question}\n\n"
        f"Candidate's answer: {req.answer}\n\n"
        f"Give constructive, specific feedback on this answer: what was strong, "
        f"what was weak, and how to improve it. Keep it concise."
    )
    message = client.messages.create(
        model=FEEDBACK_MODEL,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    return FeedbackResponse(feedback=_first_text_block(message))
