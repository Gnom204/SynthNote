from __future__ import annotations

import logging
import os
from pathlib import Path

import fitz
from pypdf import PdfReader
from pypdf.errors import PdfReadError


logger = logging.getLogger("app.pdf")


class PDFParseError(Exception):
    pass


class PDFService:
    MAX_CHARS_PER_PAGE = 50_000

    def extract_text(self, file_path: str | os.PathLike[str]) -> str:
        path = Path(file_path)
        if not path.exists():
            raise PDFParseError(f"PDF file not found: {path}")
        if path.stat().st_size == 0:
            raise PDFParseError("PDF file is empty")

        text = self._extract_pymupdf(path)
        if text:
            return text

        return self._extract_pypdf(path)

    def _extract_pymupdf(self, path: Path) -> str:
        try:
            doc = fitz.open(path)
        except Exception as exc:
            logger.warning("pymupdf_open_failed", extra={"path": str(path), "error": str(exc)})
            return ""

        chunks: list[str] = []
        try:
            for page_idx in range(len(doc)):
                page = doc[page_idx]
                try:
                    t = (page.get_text() or "").strip()
                except Exception as exc:
                    logger.warning(
                        "pymupdf_page_failed",
                        extra={"page": page_idx, "error": str(exc)},
                    )
                    continue
                if not t:
                    continue
                if len(t) > self.MAX_CHARS_PER_PAGE:
                    t = t[: self.MAX_CHARS_PER_PAGE]
                chunks.append(t)
        finally:
            doc.close()

        return "\n\n".join(chunks).strip()

    def _extract_pypdf(self, path: Path) -> str:
        try:
            reader = PdfReader(str(path))
        except PdfReadError as exc:
            raise PDFParseError(f"Could not read PDF: {exc}") from exc
        except Exception as exc:
            raise PDFParseError(f"Unexpected error opening PDF: {exc}") from exc

        if reader.is_encrypted:
            try:
                reader.decrypt("")
            except Exception as exc:
                raise PDFParseError("PDF is encrypted and cannot be opened") from exc

        chunks: list[str] = []
        for page_idx, page in enumerate(reader.pages):
            try:
                text = page.extract_text() or ""
            except Exception as exc:
                logger.warning(
                    "pdf_page_extract_failed",
                    extra={"page": page_idx, "error": str(exc)},
                )
                continue
            text = text.strip()
            if not text:
                continue
            if len(text) > self.MAX_CHARS_PER_PAGE:
                text = text[: self.MAX_CHARS_PER_PAGE]
            chunks.append(text)

        full_text = "\n\n".join(chunks).strip()
        if not full_text:
            raise PDFParseError("No extractable text found in PDF")
        return full_text


pdf_service = PDFService()


def extract_pdf_text(file_path: str | os.PathLike[str]) -> str:
    return pdf_service.extract_text(file_path)
