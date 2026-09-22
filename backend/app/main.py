from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core import except_handler
from app.feature.auth.routes import router as auth_routes
from app.feature.think.routes import router as think_routes
from app.feature.user.routes import router as user_routes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://192.168.11.3:3000",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes)
app.include_router(think_routes)
app.include_router(user_routes)

except_handler.exception_handler_all(app)