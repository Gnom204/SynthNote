import enum
from datetime import date

from sqlalchemy import Boolean, Date, Enum as SAEnum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import BaseModel


class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class ActivityLevelEnum(str, enum.Enum):
    sedentary = "sedentary"
    light = "light"
    moderate = "moderate"
    active = "active"
    very_active = "very_active"


class User(BaseModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[GenderEnum | None] = mapped_column(SAEnum(GenderEnum, name="gender_enum"), nullable=True)
    height_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    activity_level: Mapped[ActivityLevelEnum | None] = mapped_column(
        SAEnum(ActivityLevelEnum, name="activity_level_enum"),
        nullable=True,
    )
    daily_calorie_goal: Mapped[int | None] = mapped_column(Integer, nullable=True)
    daily_protein_goal: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_fat_goal: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_carbs_goal: Mapped[float | None] = mapped_column(Float, nullable=True)

    foods: Mapped[list["Food"]] = relationship(
        "Food",
        back_populates="created_by_user",
        foreign_keys="Food.created_by_user_id",
    )
    food_diary_entries: Mapped[list["FoodDiaryEntry"]] = relationship(
        "FoodDiaryEntry",
        back_populates="user",
    )
    workout_sessions: Mapped[list["WorkoutSession"]] = relationship(
        "WorkoutSession",
        back_populates="user",
    )
    exercises: Mapped[list["Exercise"]] = relationship(
        "Exercise",
        back_populates="created_by_user",
        foreign_keys="Exercise.created_by_user_id",
    )

