from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError
from re import match
from uuid import UUID, uuid4
from datetime import datetime, timezone

from app.core import security, models
from app.core.schemas import security as core_schemas
from app.core.config import settings
from app.feature.auth import repository, schemas as auth_schemas, exceptions

async def send_email_verification(db: AsyncSession, user: auth_schemas.sendUserCreate | None) -> None:
    # メール送信処理をここに実装する
    return

async def store_refresh_token(db: AsyncSession, user_id: UUID, family_id: UUID, refresh_token: str, now: datetime) -> None:
    payload = security.decode_token(refresh_token)

    db_refresh_token = models.RefreshToken(
        id=UUID(payload["jti"]),
        user_id=user_id,
        family_id=family_id,
        expires_at=datetime.fromtimestamp(
            payload["exp"],
            tz=timezone.utc,
        ),
        created_at=now,
        revoked_at=None,
    )
    await repository.insert_refresh_token(db, db_refresh_token)

async def signup_user(db: AsyncSession, user: auth_schemas.UserCreate) -> auth_schemas.TokenResponse:
    if any(not i for i in [user.name, user.password, user.email]):
        raise exceptions.RequiredFieldsAreMissingError()
    if not match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", user.email):
        raise exceptions.InvalidEmailFormatError()
    if len(user.password) < 8:
        raise exceptions.PasswordTooShortError()
    if len(user.password) > 64:
        raise exceptions.PasswordTooLongError()
    if len(user.name) > 64:
        raise exceptions.UsernameTooLongError()
    user.password = security.get_password_hash(user.password)
    try:
        family_id = uuid4()
        db_user = await repository.insert_user(db, user.convert())
        access_token = security.create_access_token(sub=db_user.id)
        refresh_token = security.create_refresh_token(sub=db_user.id, family_id=family_id)
        await store_refresh_token(db, user_id=db_user.id, family_id=family_id, refresh_token=refresh_token, now=datetime.now(timezone.utc))
        await db.commit()
        return auth_schemas.TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )
    except Exception:
        await db.rollback()
        raise

async def login_user(db: AsyncSession, user: auth_schemas.UserLogin) -> auth_schemas.TokenResponse:
    if any(not i for i in [user.password, user.email]):
        raise exceptions.RequiredFieldsAreMissingError()
    if not match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", user.email):
        raise exceptions.InvalidEmailFormatError()
    if len(user.password) < 8:
        raise exceptions.PasswordTooShortError()
    if len(user.password) > 64:
        raise exceptions.PasswordTooLongError()
    try:
        family_id = uuid4()
        db_user = await repository.get_user_by_email(db, user.email)
        if db_user is None:
            security.verify_password(user.password, security.DUMMY_HASH)
            raise exceptions.UncorrectCredentialsError()
        if not security.verify_password(user.password, db_user.hashed_password):
            raise exceptions.UncorrectCredentialsError()
        access_token = security.create_access_token(sub=db_user.id)
        refresh_token = security.create_refresh_token(sub=db_user.id, family_id=family_id)
        await store_refresh_token(db, user_id=db_user.id, family_id=family_id, refresh_token=refresh_token, now=datetime.now(timezone.utc))
        await db.commit()
        return auth_schemas.TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )
    except Exception:
        await db.rollback()
        raise

async def logout_user(db: AsyncSession, token: models.RefreshToken) -> None:
    try:
        token.revoked_at = datetime.now(timezone.utc)
        await db.commit()
    except Exception:
        await db.rollback()
        raise

async def refresh_token(db: AsyncSession, token: models.RefreshToken) -> auth_schemas.TokenResponse:
    try:
        family_id = token.family_id
        user_id = token.user_id
        now = datetime.now(timezone.utc)

        token.revoked_at = now
        new_refresh_token = security.create_refresh_token(sub=user_id, family_id=family_id)
        await store_refresh_token(db, user_id=user_id, family_id=family_id, refresh_token=new_refresh_token, now=datetime.now(timezone.utc))
        await db.commit()

        new_access_token = security.create_access_token(sub=user_id)
        return auth_schemas.TokenResponse(access_token=new_access_token, refresh_token=new_refresh_token, user_id=user_id)

    except Exception:
        await db.rollback()
        raise
