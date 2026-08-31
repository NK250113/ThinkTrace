from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from app.core.schemas.error import ErrorResponse
from app.feature.note import exceptions


async def note_not_found(
    request: Request,
    exc: exceptions.NoteNotFoundError,
):
    error = ErrorResponse(
        code = "NOTE_NOT_FOUND",
        message = "The note is not found.",
    )
    return JSONResponse(
        status_code=404,
        content=jsonable_encoder(error),
    )

async def required_fields_missing(
    request: Request,
    exc: exceptions.RequiredFieldsAreMissingError,
):
    error = ErrorResponse(
        code = "REQUIRED_FIELDS_MISSING",
        message = "Required fields are missing.",
    )
    return JSONResponse(
        status_code=400,
        content=jsonable_encoder(error),
    )
