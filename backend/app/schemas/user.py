from datetime import date
from enum import Enum

from pydantic import BaseModel, ConfigDict


class GenderEnum(str, Enum):
    male = "male"
    female = "female"
    other = "other"


class ActivityLevelEnum(str, Enum):
    sedentary = "sedentary"
    light = "light"
    moderate = "moderate"
    active = "active"
    very_active = "very_active"


class UserBase(BaseModel):
    full_name: str | None = None
    avatar_url: str | None = None
    date_of_birth: date | None = None
    gender: GenderEnum | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    activity_level: ActivityLevelEnum | None = None
    daily_calorie_goal: int | None = None
    daily_protein_goal: float | None = None
    daily_fat_goal: float | None = None
    daily_carbs_goal: float | None = None


class UserProfileUpdate(UserBase):
    model_config = ConfigDict(from_attributes=True)


class UserGoalsUpdate(BaseModel):
    daily_calorie_goal: int | None = None
    daily_protein_goal: float | None = None
    daily_fat_goal: float | None = None
    daily_carbs_goal: float | None = None

    model_config = ConfigDict(from_attributes=True)


class UserProfileResponse(UserBase):
    id: str
    email: str
    is_active: bool
    is_verified: bool
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)

