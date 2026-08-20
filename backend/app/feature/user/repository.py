from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.shared import models
from app.feature.user.exceptions import RegisteredEmailError

async def insert_user(db: AsyncSession, user: models.User = None):
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

async def get_users(db: AsyncSession):
    result = await db.execute(select(models.User))
    users = result.scalars().all()

    return users
