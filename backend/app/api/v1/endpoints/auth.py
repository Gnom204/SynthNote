from __future__ import annotations

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.core.config import settings
from app.db.session import get_db
from app.repositories.user import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, RefreshRequest, TokenResponse
from app.schemas.common import MessageResponse
from app.schemas.user import UserProfileResponse
from app.services.auth import AuthService


router = APIRouter(prefix="/auth", tags=["auth"])

REFRESH_COOKIE_NAME = "refresh_token"


def _secure_cookie() -> bool:
    return True


def _refresh_cookie_max_age_seconds() -> int:
    return int(settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400)


def _client_type(request: Request) -> str | None:
    return request.headers.get("X-Client-Type")


@router.post("/register", response_model=TokenResponse)
async def register(
    payload: RegisterRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    auth_service = AuthService(UserRepository(db))
    _, access_token, refresh_token = await auth_service.register(payload.email, payload.password, payload.full_name)

    if _client_type(request) == "web":
        response.set_cookie(
            key=REFRESH_COOKIE_NAME,
            value=refresh_token,
            httponly=True,
            secure=_secure_cookie(),
            samesite="lax",
            max_age=_refresh_cookie_max_age_seconds(),
            path="/api/v1/auth/refresh",
        )

    return TokenResponse(access_token=access_token, refresh_token=refresh_token, token_type="bearer")


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        body: dict[str, Any] = await request.json()
        email = body.get("email")
        password = body.get("password")
        if not email or not password:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid payload")
    else:
        form = await request.form()
        email = form.get("email") or form.get("username")
        password = form.get("password")
        if not email or not password:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid payload")

    auth_service = AuthService(UserRepository(db))
    _, access_token, refresh_token = await auth_service.login(str(email), str(password))

    if _client_type(request) == "web":
        response.set_cookie(
            key=REFRESH_COOKIE_NAME,
            value=refresh_token,
            httponly=True,
            secure=_secure_cookie(),
            samesite="lax",
            max_age=_refresh_cookie_max_age_seconds(),
            path="/api/v1/auth/refresh",
        )

    return TokenResponse(access_token=access_token, refresh_token=refresh_token, token_type="bearer")


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if not refresh_token:
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            body = await request.json()
            refresh_token = body.get("refresh_token")

    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token required")

    auth_service = AuthService(UserRepository(db))
    _, access_token, new_refresh_token = await auth_service.refresh(str(refresh_token))

    if _client_type(request) == "web":
        response.set_cookie(
            key=REFRESH_COOKIE_NAME,
            value=new_refresh_token,
            httponly=True,
            secure=_secure_cookie(),
            samesite="lax",
            max_age=_refresh_cookie_max_age_seconds(),
            path="/api/v1/auth/refresh",
        )

    return TokenResponse(access_token=access_token, refresh_token=new_refresh_token, token_type="bearer")


@router.post("/logout", response_model=MessageResponse)
async def logout(response: Response):
    response.delete_cookie(key=REFRESH_COOKIE_NAME, path="/api/v1/auth/refresh")
    return MessageResponse(message="ok")


@router.get("/me", response_model=UserProfileResponse)
async def me(current_user=Depends(get_current_active_user)):
    return current_user

