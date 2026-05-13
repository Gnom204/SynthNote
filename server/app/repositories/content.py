from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session, selectinload

from app.models.content import Note, Quiz
from app.repositories.base import BaseRepository


class NoteRepository(BaseRepository[Note, Any, Any]):
    def __init__(self, session: AsyncSession):
        super().__init__(Note, session)

    async def list_for_user(
        self, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> list[Note]:
        result = await self.session.execute(
            select(Note)
            .where(Note.user_id == user_id)
            .options(selectinload(Note.quizzes))
            .order_by(Note.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().unique().all())

    async def get_for_user(self, note_id: UUID, user_id: UUID) -> Note | None:
        result = await self.session.execute(
            select(Note)
            .where(Note.id == note_id, Note.user_id == user_id)
            .options(selectinload(Note.quizzes))
        )
        return result.scalar_one_or_none()

    async def delete_for_user(self, note_id: UUID, user_id: UUID) -> bool:
        note = await self.get_for_user(note_id, user_id)
        if note is None:
            return False
        await self.session.delete(note)
        await self.session.commit()
        return True


class QuizRepository(BaseRepository[Quiz, Any, Any]):
    def __init__(self, session: AsyncSession):
        super().__init__(Quiz, session)

    async def list_for_user(
        self, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> list[Quiz]:
        result = await self.session.execute(
            select(Quiz)
            .where(Quiz.user_id == user_id)
            .order_by(Quiz.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_for_user(self, quiz_id: UUID, user_id: UUID) -> Quiz | None:
        result = await self.session.execute(
            select(Quiz).where(Quiz.id == quiz_id, Quiz.user_id == user_id)
        )
        return result.scalar_one_or_none()


# ---------- Sync versions for Celery worker ----------

class SyncNoteRepository:
    """Sync repository used inside Celery tasks (no asyncio loop available)."""

    def __init__(self, session: Session):
        self.session = session

    def create(
        self,
        *,
        user_id: UUID,
        title: str,
        summary: str,
        source_filename: str | None = None,
    ) -> Note:
        note = Note(
            user_id=user_id,
            title=title,
            summary=summary,
            source_filename=source_filename,
        )
        self.session.add(note)
        self.session.flush()
        return note


class SyncQuizRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(
        self,
        *,
        user_id: UUID,
        note_id: UUID,
        questions: list[dict],
    ) -> Quiz:
        quiz = Quiz(
            user_id=user_id,
            note_id=note_id,
            questions=questions,
            total_questions=len(questions),
        )
        self.session.add(quiz)
        self.session.flush()
        return quiz
