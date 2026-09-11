from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class LocaleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str
    name: str
    native_name: str
    is_default: bool
    enabled: bool


class LocalizationUpdate(BaseModel):
    locale_code: str = Field(
        min_length=2,
        max_length=16,
    )
    name: str | None = None
    description: str | None = None


class TranslationFieldUpdate(BaseModel):
    locale_code: str = Field(
        min_length=2,
        max_length=16,
    )
    field_key: str = Field(
        min_length=1,
        max_length=150,
    )
    value: str | None = None


class LocalizationCompleteness(BaseModel):
    locale_code: str
    total_fields: int
    translated_fields: int
    percentage: float
    complete: bool
