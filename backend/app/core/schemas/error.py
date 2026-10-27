from pydantic import BaseModel

class ErrorDetail(BaseModel):
    code: str
    message: str

class ErrorResponse(BaseModel):
    status_code: int
    content: ErrorDetail
    headers: dict = None

class ApplicationError(Exception):
    code: str
    message: str
    status_code: int