from __future__ import annotations

from uuid import UUID

from sqlalchemy import ForeignKey, Integer, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import BaseModel


class Note(BaseModel):
    """A note (summary) generated from a source PDF."""

    __tablename__ = "notes"

    user_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(512), nullable=False, default="Untitled")
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    source_filename: Mapped[str | None] = mapped_column(String(512), nullable=True)

    quizzes: Mapped[list["Quiz"]] = relationship(
        "Quiz",
        back_populates="note",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class Quiz(BaseModel):
    """A quiz attached to a note. Questions are stored as JSON."""

    __tablename__ = "quizzes"

    note_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("notes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # questions is a list of:
    # { "question": str, "options": [str, ...], "correct_index": int, "explanation": str | None }
    questions: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    total_questions: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    note: Mapped["Note"] = relationship("Note", back_populates="quizzes", lazy="joined")
