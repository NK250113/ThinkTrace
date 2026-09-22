from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import database
from app.core.responses import http_responses
from app.feature.auth import schemas, service
from app.core.config import settings

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
    db: AsyncSession = Depends(database.get_db),
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
    db: AsyncSession = Depends(database.get_db),
    user: schemas.UserCreate = None
) -> schemas.Message:
    token = await service.signup_user(db, user)
    response.set_cookie(
        key="access_token",
        value=token.access_token,
        httponly=True,
        secure=False, # 本番環境ではTrueにする
        samesite="lax",
        max_age=60 * settings.ACCESS_TOKEN_EXPIRE_MINUTES,
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
    db: AsyncSession = Depends(database.get_db),
    user: schemas.UserLogin = None
) -> schemas.Message:
    token = await service.login_user(db, user)
    response.set_cookie(
        key="access_token",
        value=token.access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * settings.ACCESS_TOKEN_EXPIRE_MINUTES,
    )
    return schemas.Message(message="Login successful")
