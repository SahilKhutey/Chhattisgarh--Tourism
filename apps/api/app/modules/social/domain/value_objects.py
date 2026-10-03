from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import urlparse

SUPPORTED_SCHEMES = {"http", "https"}


@dataclass(frozen=True, slots=True)
class SourceUrl:
    value: str

    def __post_init__(self) -> None:
        parsed = urlparse(self.value)

        if parsed.scheme not in SUPPORTED_SCHEMES:
            raise ValueError("Source URL must use HTTP or HTTPS.")

        if not parsed.netloc:
            raise ValueError("Source URL must contain a hostname.")

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
