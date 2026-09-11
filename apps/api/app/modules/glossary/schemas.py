from __future__ import annotations

from pydantic import BaseModel, Field


class GlossaryTranslation(BaseModel):
    locale_code: str
    term: str
    synonyms: list[str] = Field(default_factory=list)


class GlossaryCreate(BaseModel):
    key: str = Field(
        min_length=1,
        max_length=150,
        pattern=r"^[a-z][a-z0-9_]*$",
    )
    definition: str | None = None
    context: str | None = None
    preferred: bool = True
    deprecated: bool = False
    translations: list[GlossaryTranslation] = Field(default_factory=list)


class GlossaryUpdate(BaseModel):
    definition: str | None = None
    context: str | None = None
    preferred: bool | None = None
    deprecated: bool | None = None
    translations: list[GlossaryTranslation] | None = None


class GlossaryResponse(GlossaryCreate):
    id: int
