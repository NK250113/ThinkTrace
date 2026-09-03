from app.core.schemas import error

class HTTPResponses():
    def __init__(self):
        self.descriptions = {
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            409: "Conflict",
            418: "I'm a teapot",
            422: "Unprocessable Content",
            500: "Internal Server Error",
        }
    def at(self, status_code: int):
        description = self.descriptions.get(status_code, "Unknown Error")
        return {
            status_code: {
                "model": error.ErrorResponse,
                "description": description,
            }
        }
    def get(self, *status_codes: int):
        d = {}
        for code in status_codes:
            d.update(self.at(code))
        return d

http_responses = HTTPResponses()