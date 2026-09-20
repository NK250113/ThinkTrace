from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import database
from app.feature.user import schemas, service
from app.core.schemas import error
from app.feature.auth.deps import get_current_user
from app.feature.auth.schemas import UserResponse


app = APIRouter(prefix="/api/users")

@app.post("/me",
    response_model=UserResponse,
    responses={
    }
)
async def get_user_info(user: UserResponse = Depends(get_current_user), db: AsyncSession = Depends(database.get_db)) -> UserResponse:
    return user
