from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.core import models
from app.feature.auth.exceptions import RegisteredEmailError
