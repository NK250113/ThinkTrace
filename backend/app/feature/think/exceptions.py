from fastapi import status
from app.core.schemas.error import ApplicationError

class NoteNotFoundError(ApplicationError):
    status_code=status.HTTP_404_NOT_FOUND,
    code = "NOTE_NOT_FOUND",
    message = "The note is not found.",

class RequiredFieldsAreMissingError(ApplicationError):
    status_code=status.HTTP_400_BAD_REQUEST,
    code = "REQUIRED_FIELDS_MISSING",
    message = "Required fields are missing.",

ERROR_EXCEPTIONS = [
    NoteNotFoundError,
    RequiredFieldsAreMissingError,
]