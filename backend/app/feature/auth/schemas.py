from pydantic import BaseModel
from uuid import UUID

from app.core import models
from app.core.schemas import security as core_schemas


class sendUserCreate(BaseModel):
    email: str

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    def convert(self) -> models.Users:
        return models.Users(
            name=self.name,
            email=self.email,
            hashed_password=self.password
        )

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str

    @classmethod
    def create(cls, user: models.Users) -> "UserResponse":
        return cls(
            id=user.id,
            name=user.name,
            email=user.email
        )

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str

class Message(BaseModel):
    message: str