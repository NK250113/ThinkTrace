from typing import Annotated
from fastapi import APIRouter, Depends, Cookie, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import database
from app.core.responses import http_responses
from app.feature.auth import schemas, service, deps
from app.core.config import settings
from app.core.models import RefreshToken

router = APIRouter(prefix="/api/auth")

@router.post("/signup/send",
    response_model=None,
    responses={
        200: {
            "description": "Email verification sent successfully"
        }
    }
)
async def send_signup_email(
    db: Annotated[AsyncSession, Depends(database.get_db)],
    user: schemas.sendUserCreate = None
) -> None:
    await service.send_email_verification(db, user.email)
    return

@router.post("/signup/confirm",
    response_model=schemas.Message,
    responses=http_responses.get(
        status.HTTP_400_BAD_REQUEST,
        status.HTTP_409_CONFLICT,
        status.HTTP_422_UNPROCESSABLE_CONTENT,
    ),
)
async def signup_user(
    response: Response,
    db: Annotated[AsyncSession, Depends(database.get_db)],
    user: schemas.UserCreate = None
) -> schemas.Message:
    tokens = await service.signup_user(db, user)
    response.set_cookie(
        key="access_token",
        value=tokens.access_token,
        httponly=True,
        secure=False, # 本番環境ではTrueにする
        samesite="lax",
        max_age=60 * settings.ACCESS_TOKEN_EXPIRE_MINUTES,
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=86400 * settings.REFRESH_TOKEN_EXPIRE_DAYS,
    )
    return schemas.Message(message="Signup successful")

@router.post("/login",
    response_model=schemas.Message,
    responses=http_responses.get(
        status.HTTP_401_UNAUTHORIZED,
    ),
)
async def login_user(
    response: Response,
    db: Annotated[AsyncSession, Depends(database.get_db)],
    user: schemas.UserLogin = None
) -> schemas.Message:
    tokens = await service.login_user(db, user)
    response.set_cookie(
        key="access_token",
        value=tokens.access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * settings.ACCESS_TOKEN_EXPIRE_MINUTES,
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=86400 * settings.REFRESH_TOKEN_EXPIRE_DAYS,
    )
    return schemas.Message(message="Login successful")

@router.post("/logout",
    response_model=schemas.Message,
    responses={
        200: {
            "description": "Logout successful"
        }
    }
)
def logout(
    response: Response,
    db: Annotated[AsyncSession, Depends(database.get_db)],
    refresh_token: Annotated[RefreshToken, Depends(deps.get_current_refresh_token)]
) -> schemas.Message:
    service.logout_user(db, refresh_token)
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True,
        samesite="lax",
    )

    return schemas.Message(message="Logout successful")

@router.post("/auth/refresh")
async def refresh_access_token(
    response: Response,
    db: Annotated[AsyncSession, Depends(database.get_db)],
    refresh_token: Annotated[RefreshToken, Depends(deps.get_current_refresh_token)],
):
    new_token = await service.refresh_token(db, refresh_token)
    response.set_cookie(
        key="access_token",
        value=new_token.access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * settings.ACCESS_TOKEN_EXPIRE_MINUTES,
    )
    response.set_cookie(
        key="refresh_token",
        value=new_token.refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=86400 * settings.REFRESH_TOKEN_EXPIRE_DAYS,
    )
    return {
        "message": "Token refreshed",
    }