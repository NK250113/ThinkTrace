from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared import database
from app.shared.schemas import error
from app.feature.user import schemas, service

app = APIRouter()

@app.post("/register/submit",
    response_model=schemas.UserResponse,
    responses={
        400: {
            "model": error.ErrorResponse,
            "description": "Bad Request",
        },
        409: {
            "model": error.ErrorResponse,
            "description": "Conflict",
        },
        422: {
            "model": error.ErrorResponse,
            "description": "Unprocessable Content",
        },
    },
)
async def register_user(
    db: AsyncSession = Depends(database.get_db),
    user: schemas.UserCreate = None
):
    return await service.register_user(db, user)