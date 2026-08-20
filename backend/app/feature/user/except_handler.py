from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from app.shared.schemas.error import ErrorResponse
from app.feature.user import exceptions

async def required_fields_are_missing(
    request: Request,
    exc: exceptions.RequiredFieldsAreMissingError,
):
    error = ErrorResponse(
        code = "MISSING_PARAMETERS",
        message = "Some required fields are missing",
    )
    return JSONResponse(
        status_code=400,
        content=jsonable_encoder(error),
    )

async def invalid_email_format(
    request: Request,
    exc: exceptions.InvalidEmailFormatError,
):
    error = ErrorResponse(
        code = "INVALID_EMAIL_FORMAT",
        message = "The email address is not in the correct format.",
    )
    return JSONResponse(
        status_code=400,
        content=jsonable_encoder(error),
    )

async def non_existent_email(
    request: Request,
    exc: exceptions.NonExistentEmailError,
):
    error = ErrorResponse(
        code = "NON_EXISTENT_EMAIL",
        message = "The email address does not exist.",
    )
    return JSONResponse(
        status_code=409,
        content=jsonable_encoder(error),
    )

async def registered_email(
    request: Request,
    exc: exceptions.RegisteredEmailError,
):
    error = ErrorResponse(
        code = "REGISTERED_EMAIL",
        message = "The email address is already registered.",
    )
    return JSONResponse(
        status_code=409,
        content=jsonable_encoder(error),
    )

async def registered_usercode(
    request: Request,
    exc: exceptions.RegisteredUsercodeError,
):
    error = ErrorResponse(
        code = "REGISTERED_USERCODE",
        message = "The user code is already registered.",
    )
    return JSONResponse(
        status_code=409,
        content=jsonable_encoder(error),
    )

async def password_too_short(
    request: Request,
    exc: exceptions.PasswordTooShortError,
):
    error = ErrorResponse(
        code = "PASSWORD_TOO_SHORT",
        message = "Password must be at least 8 characters long.",
    )
    return JSONResponse(
        status_code=422,
        content=jsonable_encoder(error),
    )

async def password_too_long(
    request: Request,
    exc: exceptions.PasswordTooLongError,
):
    error = ErrorResponse(
        code = "PASSWORD_TOO_LONG",
        message = "Password must be 64 characters or fewer",
    )
    return JSONResponse(
        status_code=422,
        content=jsonable_encoder(error),
    )

async def username_too_long(
    request: Request,
    exc: exceptions.UsernameTooLongError,
):
    error = ErrorResponse(
        code = "USERNAME_TOO_LONG",
        message = "Usernames must be 32 characters or fewer",
    )
    return JSONResponse(
        status_code=422,
        content=jsonable_encoder(error),
    )

def exception_handler_register_user(app: FastAPI):
    app.add_exception_handler(
        exceptions.RequiredFieldsAreMissingError,
        required_fields_are_missing,
    )
    app.add_exception_handler(
        exceptions.InvalidEmailFormatError,
        invalid_email_format,
    )
    app.add_exception_handler(
        exceptions.NonExistentEmailError,
        non_existent_email,
    )
    app.add_exception_handler(
        exceptions.RegisteredEmailError,
        registered_email,
    )
    app.add_exception_handler(
        exceptions.RegisteredUsercodeError,
        registered_usercode,
    )
    app.add_exception_handler(
        exceptions.PasswordTooShortError,
        password_too_short,
    )
    app.add_exception_handler(
        exceptions.PasswordTooLongError,
        password_too_long,
    )
    app.add_exception_handler(
        exceptions.UsernameTooLongError,
        username_too_long,
    )

