from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ---------- AI output ----------

class QuizQuestion(BaseModel):
    """Single quiz question as produced by the AI."""

    question: str = Field(..., min_length=1)
    options: list[str] = Field(..., min_length=4, max_length=4)
    correct_index: int = Field(..., ge=0, le=3)
    explanation: str | None = None

    @field_validator("correct_index")
    @classmethod
    def _validate_correct_index(cls, v: int, info) -> int:
        options = info.data.get("options")
        if options is not None and v >= len(options):
            raise ValueError("correct_index out of range for options")
        return v


class GeneratedContent(BaseModel):
    """Full structured payload returned by Gemini."""

    summary: str = Field(..., min_length=1)
    quiz: list[QuizQuestion] = Field(default_factory=list)
    title: str | None = None


# ---------- DB-related ----------

class NoteCreate(BaseModel):
    user_id: UUID
    title: str
    summary: str
    source_filename: str | None = None


class QuizCreate(BaseModel):
    user_id: UUID
    note_id: UUID
    questions: list[dict]
    total_questions: int


class QuizResponse(BaseModel):
    id: UUID
    note_id: UUID
    user_id: UUID
    questions: list[dict]
    total_questions: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NoteResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    summary: str
    source_filename: str | None
    created_at: datetime
    updated_at: datetime
    quizzes: list[QuizResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class NoteListItem(BaseModel):
    id: UUID
    title: str
    source_filename: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- API ----------

class TaskAcceptedResponse(BaseModel):
    task_id: str
    status: str = "PENDING"
    message: str = "PDF accepted, processing started"


class TaskStatusResponse(BaseModel):
    task_id: str
    status: str  # PENDING / STARTED / SUCCESS / FAILURE / RETRY / REVOKED
    note_id: UUID | None = None
    quiz_id: UUID | None = None
    error: str | None = None
