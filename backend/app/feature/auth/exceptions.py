from fastapi import status
from app.core.schemas.error import ApplicationError

class RequiredFieldsAreMissingError(ApplicationError):
    status_code=status.HTTP_400_BAD_REQUEST
    code = "MISSING_PARAMETERS"
    message = "Some required fields are missing"

class InvalidEmailFormatError(ApplicationError):
    status_code=status.HTTP_400_BAD_REQUEST
    code = "INVALID_EMAIL_FORMAT"
    message = "The email address is not in the correct format."

class NonExistentEmailError(ApplicationError):
    status_code=status.HTTP_409_CONFLICT
    code = "NON_EXISTENT_EMAIL"
    message = "The email address does not exist."

class RegisteredEmailError(ApplicationError):
    status_code=status.HTTP_409_CONFLICT
    code = "REGISTERED_EMAIL"
    message = "The email address is already registered."

class PasswordTooShortError(ApplicationError):
    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT
    code = "PASSWORD_TOO_SHORT"
    message = "Password must be at least 8 characters long."

class PasswordTooLongError(ApplicationError):
    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT
    code = "PASSWORD_TOO_LONG"
    message = "Password must be 64 characters or fewer"

class UsernameTooLongError(ApplicationError):
    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT
    code = "USERNAME_TOO_LONG"
    message = "Usernames must be 64 characters or fewer"

class UncorrectCredentialsError(ApplicationError):
    status_code=status.HTTP_401_UNAUTHORIZED
    code = "UNCORRECT_CREDENTIALS"
    message = "The email or password is incorrect."

ERROR_EXCEPTIONS_COMMON = [
    RequiredFieldsAreMissingError,
    InvalidEmailFormatError,
    NonExistentEmailError,
    RegisteredEmailError,
    PasswordTooShortError,
    PasswordTooLongError,
    UsernameTooLongError,
    UncorrectCredentialsError
]


class NonExistentAccessTokenError(ApplicationError):
    status_code=status.HTTP_401_UNAUTHORIZED
    code = "INVALID_ACCESS_TOKEN"
    message = "The access token does not exist."

class InvalidAccessTokenError(ApplicationError):
    status_code=status.HTTP_401_UNAUTHORIZED
    code = "INVALID_ACCESS_TOKEN"
    message = "The access token is invalid."

class NonExistentRefreshTokenError(ApplicationError):
    status_code=status.HTTP_401_UNAUTHORIZED
    code = "INVALID_REFRESH_TOKEN"
    message = "The refresh token does not exist."

class InvalidRefreshTokenError(ApplicationError):
    status_code=status.HTTP_401_UNAUTHORIZED
    code = "INVALID_REFRESH_TOKEN"
    message = "The refresh token is invalid."

ERROR_EXCEPTIONS_BEARER = [
    NonExistentAccessTokenError,
    InvalidAccessTokenError,
    NonExistentRefreshTokenError,
    InvalidRefreshTokenError
]