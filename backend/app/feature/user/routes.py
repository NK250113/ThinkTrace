from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import database
from app.feature.user import schemas, service
from app.core.schemas import error
from app.feature.auth.deps import get_current_user
from app.feature.auth.schemas import UserResponse


router = APIRouter(prefix="/api/users")

