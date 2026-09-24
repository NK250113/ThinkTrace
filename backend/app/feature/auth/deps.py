from typing import Annotated
from fastapi import Depends, Cookie
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from datetime import datetime, timezone

from app.core.security import decode_token
from app.feature.auth import repository, exceptions, schemas
from app.core import database, models


async def get_current_user(
    db: Annotated[AsyncSession, Depends(database.get_db)],
    access_token: Annotated[str | None, Cookie()] = None,
) -> schemas.UserResponse:
    if access_token is None:
        raise exceptions.NonExistentAccessTokenError()
    try:
        payload = decode_token(access_token)

        if payload.get("type") != "access":
            raise exceptions.InvalidAccessTokenError()

        user_id = payload.get("sub")

        if user_id is None:
            raise exceptions.InvalidAccessTokenError()

    except JWTError:
        raise exceptions.InvalidAccessTokenError()

    user = await repository.get_user_by_id(db, user_id=user_id)

    if user is None:
        raise exceptions.InvalidAccessTokenError()

    return schemas.UserResponse.create(user)


async def get_current_refresh_token(
    db: Annotated[AsyncSession, Depends(database.get_db)],
    refresh_token: Annotated[str | None, Cookie()] = None,
) -> models.RefreshToken:
    if refresh_token is None:
        raise exceptions.NonExistentRefreshTokenError()

    try:
        payload = decode_token(refresh_token)

        if payload.get("type") != "refresh":
            raise exceptions.InvalidRefreshTokenError()

        user_id = payload.get("sub")
        jti = payload.get("jti")

        if user_id is None or jti is None:
            raise exceptions.InvalidRefreshTokenError()

    except JWTError:
        raise exceptions.InvalidRefreshTokenError()

    token = await repository.get_refresh_token(
        db,
        token_id=UUID(jti),
    )

    if token is None:
        raise exceptions.InvalidRefreshTokenError()

    if token.revoked_at is not None:
        print(f"Token revoked at: {token.revoked_at}")
        raise exceptions.InvalidRefreshTokenError()

    if token.expires_at <= datetime.now(timezone.utc):
        raise exceptions.InvalidRefreshTokenError()

    return token