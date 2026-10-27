from fastapi import Request, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from app.core.responses import http_responses
from app.core import except_handler
from app.core.schemas.error import ErrorDetail, ErrorResponse
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

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> ErrorResponse:
    return ErrorResponse(
        status_code=422,
        content = ErrorDetail(
            code=http_responses.descriptions.get(422),
            message="リクエストの形式が正しくありません",
        )
    )