from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from app.core.schemas.error import ErrorDetail, ErrorResponse, ApplicationError
from app.feature.auth import exceptions as auth_exc
from app.feature.think import exceptions as think_exc


async def exception_handler_common(
    request: Request,
    exc: ApplicationError
) -> ErrorResponse:
    error = ErrorDetail(
        code=exc.code,
        message=exc.message
    )
    return ErrorResponse(
        status_code=exc.status_code,
        content=jsonable_encoder(error)
    )
ERROR_EXCEPTIONS_COMMON = auth_exc.ERROR_EXCEPTIONS_COMMON + think_exc.ERROR_EXCEPTIONS

async def exception_handler_bearer(
    request: Request,
    exc: ApplicationError
) -> ErrorResponse:
    error = ErrorDetail(
        code=exc.code,
        message=exc.message
    )
    return ErrorResponse(
        status_code=exc.status_code,
        content=jsonable_encoder(error),
        headers={"WWW-Authenticate": "Bearer"}
    )
ERROR_EXCEPTIONS_BEARER = auth_exc.ERROR_EXCEPTIONS_BEARER

def exception_handler_all(app: FastAPI):
    for exception in ERROR_EXCEPTIONS_COMMON:
        app.add_exception_handler(
            exception,
            exception_handler_common
        )
    for exception in ERROR_EXCEPTIONS_BEARER:
        app.add_exception_handler(
            exception,
            exception_handler_bearer
        )
