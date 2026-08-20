class RequiredFieldsAreMissingError(Exception):
    pass

class InvalidEmailFormatError(Exception):
    pass

class NonExistentEmailError(Exception):
    pass

class RegisteredEmailError(Exception):
    pass

class RegisteredUsercodeError(Exception):
    pass

class PasswordTooShortError(Exception):
    pass

class PasswordTooLongError(Exception):
    pass

class UsernameTooLongError(Exception):
    pass
