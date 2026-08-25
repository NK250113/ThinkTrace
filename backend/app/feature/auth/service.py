from sqlalchemy.ext.asyncio import AsyncSession
from re import match
from random import choice, randint
import string
from datetime import timedelta

from app.core import models, security
from app.core.schemas import security as core_schemas
from app.core.config import settings
from app.feature.auth import repository, schemas as auth_schemas, exceptions

async def send_email_verification(db: AsyncSession, user: auth_schemas.sendUserCreate | None) -> None:
    # メール送信処理をここに実装する
    return

async def register_user(db: AsyncSession, user: auth_schemas.UserCreate) -> core_schemas.Token:
    if any(not i for i in [user.name, user.password, user.email]):
        raise exceptions.RequiredFieldsAreMissingError()
    if not match(r"[^@]+@[^@]+\.[^@]+", user.email):
        raise exceptions.InvalidEmailFormatError()
    if len(user.password) < 8:
        raise exceptions.PasswordTooShortError()
    if len(user.password) > 64:
        raise exceptions.PasswordTooLongError()
    if len(user.name) > 32:
        raise exceptions.UsernameTooLongError()
    while True:
        try:
            db_user = await repository.insert_user(db, models.User(
                name=user.name,
                email=user.email,
                hashed_password=user.password,
                usercode=''.join([choice(string.ascii_letters.replace('l', '').replace('I', '').replace('O', '') + string.digits) for _ in range(randint(8, 12))])
            ))
            break
        except exceptions.RegisteredUsercodeError:
            pass
    return auth_schemas.UserResponse(
        id=db_user.id,
        name=db_user.name,
        email=db_user.email
    )

async def login_user(db: AsyncSession, user: auth_schemas.UserLogin) -> core_schemas.Token:
    input_password = security.get_password_hash(user.password)
    db_user = await repository.get_user_by_email(db, user.email)
    if db_user is None:
        security.verify_password(input_password, security.DUMMY_HASH)
        raise exceptions.unauthorizedError()
    if not security.verify_password(input_password, db_user.hashed_password):
        raise exceptions.unauthorizedError()
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": db_user.id}, expires_delta=access_token_expires
    )
    return core_schemas.Token(access_token=access_token, token_type="bearer")