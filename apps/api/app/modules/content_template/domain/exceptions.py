class TemplateError(Exception):
    """Base template domain exception."""


class TemplateNotFoundError(TemplateError):
    pass


class TemplateAlreadyExistsError(TemplateError):
    pass


class TemplateValidationError(TemplateError):
    pass


class TemplatePublishError(TemplateError):
    pass


class TemplateImmutableError(TemplateError):
    pass
