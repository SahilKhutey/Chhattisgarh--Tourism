import re
from pydantic import BaseModel, Field, field_validator


FIELD_KEY_PATTERN = re.compile(r"^[a-z][a-z0-9_]*$")


class TemplateFieldConfig(BaseModel):
    options: list[dict[str, str]] | None = None
    relation_template_slug: str | None = None
    min: float | None = None
    max: float | None = None
    step: float | None = None
    max_items: int | None = None
    accept: list[str] | None = None
    bounds: dict[str, float] | None = None
    require_alt_text: bool | None = None


class TemplateFieldInput(BaseModel):
    key: str = Field(
        min_length=1,
        max_length=80,
    )
    label: str = Field(
        min_length=1,
        max_length=200,
    )
    type: str
    required: bool = False
    translatable: bool = True
    order: int = Field(
        ge=0,
    )
    group: str | None = None
    helpText: str | None = None
    config: TemplateFieldConfig = Field(
        default_factory=TemplateFieldConfig,
    )

    @field_validator("key")
    @classmethod
    def validate_key(cls, value: str) -> str:
        if not FIELD_KEY_PATTERN.fullmatch(value):
            raise ValueError(
                "Field key must contain lowercase letters, numbers and underscores and start with a letter."
            )
        return value


class TemplateFieldsUpdate(BaseModel):
    fields: list[TemplateFieldInput]


class TemplateMetadataUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    slug: str = Field(min_length=1, max_length=180)
    description: str | None = None
    icon: str | None = None
    category: str | None = None


class TemplateDraftUpdate(BaseModel):
    metadata: TemplateMetadataUpdate
    fields: list[TemplateFieldInput]
