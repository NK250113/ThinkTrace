from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.core import models
from app.feature.auth.exceptions import RegisteredEmailError

async def insert_user(db: AsyncSession, user: models.User = None) -> models.User:
    try:
        db.add(user)
        await db.commit()
        await db.refresh(user)

    except IntegrityError as e:
        await db.rollback()
        if "uq_users_email" in str(e):
            raise RegisteredEmailError()
        raise

    return user

async def get_user_by_email(db: AsyncSession, email: str) -> models.User | None:
    result = await db.execute(select(models.User).where(models.User.email == email))
    user = result.scalar_one_or_none()
    return user

async def get_user_by_id(db: AsyncSession, user_id: int) -> models.User | None:
    user = await db.scalar(select(models.User).where(models.User.id == user_id))
    return user