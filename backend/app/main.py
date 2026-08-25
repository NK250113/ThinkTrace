from fastapi import FastAPI

from app.feature.auth import except_handler as auth_exceptions
from app.feature.auth.routes import app as user_routes

app = FastAPI()

app.include_router(user_routes)

auth_exceptions.exception_handler_register_user(app)
auth_exceptions.exception_handler_login_user(app)