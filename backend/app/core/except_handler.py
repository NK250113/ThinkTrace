from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from app.core.schemas.error import ErrorResponse, ApplicationError
from app.feature.auth import exceptions as auth_exc
from app.feature.think import exceptions as think_exc


async def exception_handler(
    request: Request,
    exc: ApplicationError,
):
    error = ErrorResponse(
        code=exc.code,
        message=exc.message,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=jsonable_encoder(error),
    )

ERROR_EXCEPTIONS_ALL = auth_exc.ERROR_EXCEPTIONS + think_exc.ERROR_EXCEPTIONS

# 分離などは必要になったら
def exception_handler_all(app: FastAPI):
    for exception in ERROR_EXCEPTIONS_ALL:
        app.add_exception_handler(
            exception,
            exception_handler,
        )
