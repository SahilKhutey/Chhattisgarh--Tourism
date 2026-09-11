class TemplateError(Exception):
    pass


class TemplateValidationError(TemplateError, ValueError):
    pass


class TemplateNotFoundError(TemplateError):
    pass


class TemplateConflictError(TemplateError):
    pass


class TemplateConcurrencyError(TemplateError):
    pass
