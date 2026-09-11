from .models import ContentTemplateModel, TemplateFieldModel, TemplateGroupModel
from .repository import SQLAlchemyTemplateRepository

TemplateRepository = SQLAlchemyTemplateRepository

__all__ = [
    "ContentTemplateModel",
    "TemplateFieldModel",
    "TemplateGroupModel",
    "SQLAlchemyTemplateRepository",
    "TemplateRepository",
]
