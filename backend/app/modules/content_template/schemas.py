from pydantic import BaseModel, Field, field_validator
import re


class TemplateMetadataInput(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    slug: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    icon: str | None = None
    category: str | None = None

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, value: str) -> str:
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", value):
            raise ValueError(
                "slug must contain lowercase letters, numbers and hyphens"
            )
        return value
