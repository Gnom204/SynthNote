from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


gender_enum = postgresql.ENUM("male", "female", "other", name="gender_enum")
activity_level_enum = postgresql.ENUM(
    "sedentary",
    "light",
    "moderate",
    "active",
    "very_active",
    name="activity_level_enum",
)
food_meal_type_enum = postgresql.ENUM("breakfast", "lunch", "dinner", "snack", name="food_meal_type_enum")
exercise_category_enum = postgresql.ENUM(
    "chest",
    "back",
    "legs",
    "shoulders",
    "arms",
    "core",
    "cardio",
    "other",
    name="exercise_category_enum",
)


def upgrade() -> None:
    gender_enum.create(op.get_bind(), checkfirst=True)
    activity_level_enum.create(op.get_bind(), checkfirst=True)
    food_meal_type_enum.create(op.get_bind(), checkfirst=True)
    exercise_category_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("is_verified", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("avatar_url", sa.String(), nullable=True),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("gender", gender_enum, nullable=True),
        sa.Column("height_cm", sa.Float(), nullable=True),
        sa.Column("weight_kg", sa.Float(), nullable=True),
        sa.Column("activity_level", activity_level_enum, nullable=True),
        sa.Column("daily_calorie_goal", sa.Integer(), nullable=True),
        sa.Column("daily_protein_goal", sa.Float(), nullable=True),
        sa.Column("daily_fat_goal", sa.Float(), nullable=True),
        sa.Column("daily_carbs_goal", sa.Float(), nullable=True),
    )
    op.create_unique_constraint("uq_users_email", "users", ["email"])

    op.create_table(
        "foods",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("brand", sa.String(), nullable=True),
        sa.Column("barcode", sa.String(), nullable=True),
        sa.Column("calories_per_100g", sa.Float(), nullable=False),
        sa.Column("protein_per_100g", sa.Float(), nullable=False),
        sa.Column("fat_per_100g", sa.Float(), nullable=False),
        sa.Column("carbs_per_100g", sa.Float(), nullable=False),
        sa.Column("fiber_per_100g", sa.Float(), nullable=True),
        sa.Column("sugar_per_100g", sa.Float(), nullable=True),
        sa.Column("is_public", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["created_by_user_id"],
            ["users.id"],
            ondelete="SET NULL",
        ),
    )
    op.create_index("ix_foods_name", "foods", ["name"], unique=False)
    op.create_unique_constraint("uq_foods_barcode", "foods", ["barcode"])

    op.create_table(
        "food_diary_entries",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("food_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("meal_type", food_meal_type_enum, nullable=False),
        sa.Column("amount_grams", sa.Float(), nullable=False),
        sa.Column("calories", sa.Float(), nullable=False),
        sa.Column("protein", sa.Float(), nullable=False),
        sa.Column("fat", sa.Float(), nullable=False),
        sa.Column("carbs", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["food_id"], ["foods.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_food_diary_entries_user_id_date", "food_diary_entries", ["user_id", "date"], unique=False)

    op.create_table(
        "workout_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("duration_minutes", sa.Integer(), nullable=True),
        sa.Column("calories_burned", sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_workout_sessions_user_id_date", "workout_sessions", ["user_id", "date"], unique=False)

    op.create_table(
        "exercises",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("category", exercise_category_enum, nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_public", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_exercises_name", "exercises", ["name"], unique=False)

    op.create_table(
        "workout_sets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("workout_session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("exercise_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("set_number", sa.Integer(), nullable=False),
        sa.Column("reps", sa.Integer(), nullable=True),
        sa.Column("weight_kg", sa.Float(), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("distance_meters", sa.Float(), nullable=True),
        sa.Column("notes", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["workout_session_id"],
            ["workout_sessions.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["exercise_id"],
            ["exercises.id"],
            ondelete="CASCADE",
        ),
    )


def downgrade() -> None:
    op.drop_table("workout_sets")
    op.drop_table("workout_sessions")
    op.drop_table("exercises")
    op.drop_table("food_diary_entries")
    op.drop_table("foods")
    op.drop_table("users")

    exercise_category_enum.drop(op.get_bind(), checkfirst=True)
    food_meal_type_enum.drop(op.get_bind(), checkfirst=True)
    activity_level_enum.drop(op.get_bind(), checkfirst=True)
    gender_enum.drop(op.get_bind(), checkfirst=True)

