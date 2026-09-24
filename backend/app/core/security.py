from datetime import datetime, timedelta, timezone
import jwt
from uuid import uuid4, UUID
# from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash

from app.core.config import settings


password_hash = PasswordHash.recommended()

DUMMY_HASH = password_hash.hash("dummypassword")

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return password_hash.hash(password)

def decode_token(token: str) -> dict:
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
    ) # これで自動的に有効期限の検証も行われる


def create_access_token(sub: UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = ({
        "sub": str(sub),
        "exp": expire,
        "type": "access",
    })

    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

def create_refresh_token(sub: UUID, family_id: UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = ({
        "sub": str(sub),
        "exp": expire,
        "jti": str(uuid4()),
        "family_id": str(family_id),
        "type": "refresh",
    })
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )