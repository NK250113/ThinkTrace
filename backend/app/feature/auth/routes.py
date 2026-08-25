from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import database
from app.core.responses import http_responses
from app.feature.auth import schemas, service

app = APIRouter()

@app.post("/register/send",
    response_model=None,
    responses={
        200: {
            "description": "Email verification sent successfully"
        }
    }
)
async def send_register_email(
    db: AsyncSession = Depends(database.get_db),
    user: schemas.sendUserCreate = None
) -> None:
    await service.send_email_verification(db, user.email)
    return

@app.post("/register/confirm",
    response_model=schemas.UserResponse,
    responses=http_responses.get(
        status.HTTP_400_BAD_REQUEST,
        status.HTTP_409_CONFLICT,
        status.HTTP_422_UNPROCESSABLE_CONTENT,
    ),
)
async def login_user(
    db: AsyncSession = Depends(database.get_db),
    user: schemas.UserCreate = None
) -> schemas.UserResponse:
    return await service.register_user(db, user)

@app.get("/login",
    response_model=schemas.UserResponse,
    responses=http_responses.get(
        status.HTTP_401_UNAUTHORIZED,
    ),
)
async def login_user(
    db: AsyncSession = Depends(database.get_db),
    user: schemas.UserLogin = None
) -> schemas.UserResponse:
    return await service.login_user(db, user)