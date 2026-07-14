import json
import os
from typing import cast

from anthropic import Anthropic
from anthropic.types import Message, TextBlock, ToolParam, ToolUseBlock
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.types import ExceptionHandler

load_dotenv()

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

QUESTIONS_MODEL = "claude-haiku-4-5-20251001"
FEEDBACK_MODEL = "claude-sonnet-5"

app = FastAPI(title="AI Interview Prep API")

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, cast(ExceptionHandler, _rate_limit_exceeded_handler))

_extra_origins = [o.strip() for o in os.environ.get("FRONTEND_ORIGIN", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", *_extra_origins],
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
    score: int


FEEDBACK_TOOL: ToolParam = {
    "name": "provide_feedback",
    "description": "Provide structured feedback and a numeric score for an interview answer.",
    "input_schema": {
        "type": "object",
        "properties": {
            "feedback": {
                "type": "string",
                "description": (
                    "Constructive, specific feedback on the answer: what was strong, "
                    "what was weak, and how to improve it. Written in markdown. Keep it concise."
                ),
            },
            "score": {
                "type": "integer",
                "minimum": 1,
                "maximum": 10,
                "description": "A score from 1 (poor) to 10 (excellent) rating the quality of the answer.",
            },
        },
        "required": ["feedback", "score"],
    },
}


def _first_text_block(message: Message) -> str:
    block = message.content[0]
    if not isinstance(block, TextBlock):
        raise HTTPException(status_code=502, detail=f"Unexpected response block type from model: {type(block).__name__}")
    return block.text


def _first_tool_use_block(message: Message) -> ToolUseBlock:
    for block in message.content:
        if isinstance(block, ToolUseBlock):
            return block
    raise HTTPException(status_code=502, detail="Model did not return a tool call")


def _feedback_tool_result(tool_use: ToolUseBlock) -> tuple[str, int]:
    feedback = tool_use.input["feedback"]
    score = tool_use.input["score"]
    if not isinstance(feedback, str) or not isinstance(score, int):
        raise HTTPException(status_code=502, detail="Model returned malformed tool input")
    return feedback, score


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
@limiter.limit("10/minute;50/hour")
def generate_questions(request: Request, req: QuestionsRequest) -> QuestionsResponse:
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
@limiter.limit("10/minute;50/hour")
def generate_feedback(request: Request, req: FeedbackRequest) -> FeedbackResponse:
    prompt = (
        f"Interview question: {req.question}\n\n"
        f"Candidate's answer: {req.answer}\n\n"
        f"Evaluate this answer and call the provide_feedback tool with your feedback and score."
    )
    message = client.messages.create(
        model=FEEDBACK_MODEL,
        max_tokens=1024,
        tools=[FEEDBACK_TOOL],
        tool_choice={"type": "tool", "name": "provide_feedback"},
        messages=[{"role": "user", "content": prompt}],
    )
    tool_use = _first_tool_use_block(message)
    feedback, score = _feedback_tool_result(tool_use)
    return FeedbackResponse(feedback=feedback, score=score)
