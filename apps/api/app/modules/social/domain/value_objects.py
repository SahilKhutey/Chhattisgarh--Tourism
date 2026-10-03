from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import urlparse

from app.modules.social.domain.errors import SourceUrlError

SUPPORTED_SCHEMES = {"http", "https"}


@dataclass(frozen=True, slots=True)
class SourceUrl:
    value: str

    def __post_init__(self) -> None:
        parsed = urlparse(self.value)

        if parsed.scheme not in SUPPORTED_SCHEMES:
            raise SourceUrlError("Source URL must use HTTP or HTTPS.")

        if not parsed.netloc:
            raise SourceUrlError("Source URL must contain a hostname.")

    @classmethod
    def from_raw(cls, url: str) -> SourceUrl:
        if not url or not isinstance(url, str):
            raise SourceUrlError("Source URL must be a non-empty string.")
        cleaned = url.strip()
        obj = cls(cleaned)
        return cls(obj.normalized())

    @property
    def hostname(self) -> str:
        return (urlparse(self.value).hostname or "").lower()

    def normalized(self) -> str:
        parsed = urlparse(self.value)

        return parsed._replace(
            scheme=parsed.scheme.lower(),
            netloc=parsed.netloc.lower(),
            fragment="",
        ).geturl()
