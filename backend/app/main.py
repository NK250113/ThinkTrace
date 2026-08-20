from fastapi import FastAPI

from app.feature.user import except_handler as user_exceptions
from app.feature.user.routes import app as user_routes

app = FastAPI()

app.include_router(user_routes)

user_exceptions.exception_handler_register_user(app)
