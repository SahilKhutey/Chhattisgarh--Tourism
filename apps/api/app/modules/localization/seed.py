from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Locale

DEFAULT_LOCALES = [
    {
        "code": "en",
        "name": "English",
        "native_name": "English",
        "is_default": True,
        "enabled": True,
    },
    {
        "code": "hi",
        "name": "Hindi",
        "native_name": "हिन्दी",
        "is_default": False,
        "enabled": True,
    },
    {
        "code": "chg",
        "name": "Chhattisgarhi",
        "native_name": "छत्तीसगढ़ी",
        "is_default": False,
        "enabled": True,
    },
]


def seed_locales(db: Session) -> None:
    for payload in DEFAULT_LOCALES:
        existing = db.scalar(
            select(Locale).where(
                Locale.code == payload["code"]
            )
        )

        if existing:
            continue

        db.add(Locale(**payload))

    db.commit()
