from pydantic import BaseModel

class ErrorResponse(BaseModel):
    code: str
    message: str
"""
class ErrorResponse(BaseModel):
    error: ErrorDetail
    def create(self, code: str, message: str):
        self.error = ErrorDetail(code=code, message=message)
"""