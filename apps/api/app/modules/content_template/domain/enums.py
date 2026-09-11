from enum import Enum


class TemplateStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class TemplateFieldType(str, Enum):
    TEXT = "TEXT"
    TEXTAREA = "TEXTAREA"
    RICHTEXT = "RICHTEXT"
    IMAGE = "IMAGE"
    GALLERY = "GALLERY"
    GEO_POINT = "GEO_POINT"
    MAP_REGION = "MAP_REGION"
    DROPDOWN = "DROPDOWN"
    MULTI_SELECT = "MULTI_SELECT"
    TAGS = "TAGS"
    VIDEO = "VIDEO"
    AUDIO = "AUDIO"
    DATE = "DATE"
    DATETIME = "DATETIME"
    TIME = "TIME"
    NUMBER = "NUMBER"
    BOOLEAN = "BOOLEAN"
    RELATION = "RELATION"
