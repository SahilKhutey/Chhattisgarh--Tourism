from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class TemplateStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


@dataclass
class TemplateField:
    id: str
    key: str
    type: str
    label: str
    required: bool = False
    translatable: bool = True
    order: int = 0
    group: str | None = None
    help_text: str | None = None
    config: dict[str, Any] = field(default_factory=dict)


@dataclass
class ContentTemplate:
    id: str
    name: str
    slug: str
    description: str | None
    icon: str | None
    category: str | None
    status: TemplateStatus
    fields: list[TemplateField]
    current_version: int | None = None
