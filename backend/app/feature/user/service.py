from app.feature.user import schemas
from sqlalchemy.ext.asyncio import AsyncSession
from re import match
from random import choice, randint
import string

from app.shared import models
from app.feature.user import repository, exceptions

async def register_user(db: AsyncSession, user: schemas.UserCreate) -> schemas.UserResponse:
    if any(not i for i in [user.name, user.password, user.email]):
        raise exceptions.RequiredFieldsAreMissingError()
    if not match(r"[^@]+@[^@]+\.[^@]+", user.email):
        raise exceptions.InvalidEmailFormatError()
    # Emailの存在確認をここに追加
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
    return schemas.UserResponse(
        id=db_user.id,
        name=db_user.name,
        usercode=db_user.usercode,
        email=db_user.email
    )