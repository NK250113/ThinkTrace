from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import database
from app.core.schemas import error
from app.feature.user import schemas, service

app = APIRouter()
