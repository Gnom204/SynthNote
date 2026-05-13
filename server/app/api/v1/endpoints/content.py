from __future__ import annotations

import asyncio
import uuid
from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.core.config import settings
from app.db.session import get_db
from app.models.content import Note, Quiz
from app.models.user import User
from app.repositories.content import NoteRepository
from app.schemas.content import NoteListItem, NoteResponse
from app.services.ai_service import AIServiceError, get_ai_service, offline_placeholder_content
from app.services.pdf_service import PDFParseError, extract_pdf_text


router = APIRouter(prefix="/content", tags=["content"])

MAX_UPLOAD_BYTES = settings.MAX_PDF_SIZE_MB * 1024 * 1024


def _is_pdf_name(filename: str | None) -> bool:
    if not filename:
        return False
    return filename.lower().endswith(".pdf")


@router.post("/upload-pdf", response_model=NoteResponse)
async def upload_pdf(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    file: UploadFile = File(...),
):
    if not _is_pdf_name(file.filename):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are allowed.")

    raw = await file.read()
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large (max {settings.MAX_PDF_SIZE_MB} MB).",
        )
    if not raw:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file.")

    root = Path(settings.UPLOAD_DIR) / str(current_user.id)
    root.mkdir(parents=True, exist_ok=True)
    safe_stem = Path(file.filename or "document.pdf").name
    dest = root / f"{uuid.uuid4().hex}_{safe_stem}"
    dest.write_bytes(raw)

    try:
        text = await asyncio.to_thread(extract_pdf_text, str(dest))
    except PDFParseError as exc:
        dest.unlink(missing_ok=True)
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

    if not (settings.GEMINI_API_KEY or "").strip():
        generated = offline_placeholder_content(text, file.filename)
    else:
        ai = get_ai_service()
        try:
            generated = await ai.generate_content(text, str(current_user.id), file.filename)
        except AIServiceError as exc:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    title = (generated.title or "").strip() or Path(safe_stem).stem
    questions = [q.model_dump() for q in generated.quiz]

    note = Note(
        user_id=current_user.id,
        title=title,
        summary=generated.summary,
        source_filename=file.filename,
    )
    db.add(note)
    await db.flush()

    quiz = Quiz(
        user_id=current_user.id,
        note_id=note.id,
        questions=questions,
        total_questions=len(questions),
    )
    db.add(quiz)
    await db.commit()

    repo = NoteRepository(db)
    loaded = await repo.get_for_user(note.id, current_user.id)
    if loaded is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to load note.")
    return loaded


@router.get("/notes", response_model=list[NoteListItem])
async def list_notes(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    repo = NoteRepository(db)
    notes = await repo.list_for_user(current_user.id)
    return [
        NoteListItem(
            id=n.id,
            title=n.title,
            source_filename=n.source_filename,
            created_at=n.created_at,
        )
        for n in notes
    ]


@router.get("/notes/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    repo = NoteRepository(db)
    note = await repo.get_for_user(note_id, current_user.id)
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found.")
    return note


@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    repo = NoteRepository(db)
    ok = await repo.delete_for_user(note_id, current_user.id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found.")
