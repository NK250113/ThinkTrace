from pydantic import BaseModel

from app.core import models


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
    id: int
    name: str
    email: str
    def __init__(self, user: models.Users | None = None):
        if user is not None:
            self.id = user.id
            self.name = user.name
            self.email = user.email