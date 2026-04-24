from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel):
    pass


class UserProfileUpdate(UserBase):
    model_config = ConfigDict(from_attributes=True)


class UserProfileResponse(UserBase):
    id: str
    email: str
    is_active: bool
    is_verified: bool
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)

