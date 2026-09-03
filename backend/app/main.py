from fastapi import FastAPI

from app.feature.auth import except_handler as auth_exceptions
from app.feature.think import except_handler as think_exceptions
from app.feature.auth.routes import app as auth_routes
from app.feature.think.routes import app as think_routes

app = FastAPI()

app.include_router(auth_routes)
app.include_router(think_routes)

auth_exceptions.exception_handler_signup_user(app)
auth_exceptions.exception_handler_login_user(app)
think_exceptions.exception_handler_note_not_found(app)