from pydantic import BaseModel

class ErrorDetail(BaseModel):
    code: str
    message: str

class ErrorResponse(BaseModel):
    error: ErrorDetail
    def __init__(self, code: str, message: str):
        super().__init__(error=ErrorDetail(code=code, message=message))