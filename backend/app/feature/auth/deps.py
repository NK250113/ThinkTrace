from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from jwt.exceptions import InvalidTokenError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import models, security
from app.core.schemas import security as core_schemas
from app.core.config import settings
from app.feature.auth import repository, schemas as auth_schemas, exceptions
from app.core import database

async def get_current_user(db: Annotated[AsyncSession, Depends(database.get_db)], token: Annotated[str, Depends(security.oauth2_scheme)]) -> auth_schemas.UserResponse:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise exceptions.unauthorizedError
        token_data = core_schemas.TokenData(id=user_id)
    except InvalidTokenError:
        raise exceptions.unauthorizedError
    user = await repository.get_user_by_id(db, user_id=token_data.id)
    if user is None:
        raise exceptions.unauthorizedError
    return user
