from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel):
    pass


class UserProfileUpdate(UserBase):
    full_name: str | None = None

    model_config = ConfigDict(from_attributes=True)


class UserProfileResponse(UserBase):
    id: UUID
    email: str
    full_name: str | None = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

