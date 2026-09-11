from __future__ import annotations

from dataclasses import dataclass
from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import GlossaryTerm, GlossaryTermLocale


class GlossaryPublicationError(Exception):
    pass


@dataclass
class GlossaryViolation:
    key: str
    locale: str
    text: str
    message: str
    severity: str


class GlossaryValidator:
    def validate_text(
        self,
        db: Session,
        text: str,
        locale_code: str,
        severity_override: str | None = None,
    ) -> list[GlossaryViolation]:
        violations: list[GlossaryViolation] = []
        if not text:
            return violations

        terms = db.scalars(
            select(GlossaryTerm).where(GlossaryTerm.deprecated.is_(True))
        ).all()

        for term in terms:
            translation = db.scalar(
                select(GlossaryTermLocale).where(
                    GlossaryTermLocale.term_id == term.id,
                    GlossaryTermLocale.locale_code == locale_code,
                )
            )

            if translation is None:
                continue

            # Check translation term
            term_str = translation.term.lower()
            if term_str and term_str in text.lower():
                violations.append(
                    GlossaryViolation(
                        key=term.key,
                        locale=locale_code,
                        text=translation.term,
                        message=f"Deprecated glossary term used: {translation.term}",
                        severity=severity_override or "WARNING",
                    )
                )
                continue

            # Check synonyms if term didn't match
            if translation.synonyms:
                for syn in translation.synonyms.split(","):
                    clean_syn = syn.strip().lower()
                    if clean_syn and clean_syn in text.lower():
                        violations.append(
                            GlossaryViolation(
                                key=term.key,
                                locale=locale_code,
                                text=syn.strip(),
                                message=f"Deprecated glossary synonym used: {syn.strip()}",
                                severity=severity_override or "WARNING",
                            )
                        )
                        break

        return violations
