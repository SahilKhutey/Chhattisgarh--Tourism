from __future__ import annotations

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from .models import GlossaryTerm, GlossaryTermLocale
from .schemas import GlossaryCreate, GlossaryUpdate


class GlossaryService:
    def create(
        self,
        db: Session,
        payload: GlossaryCreate,
    ) -> GlossaryTerm:
        existing = db.scalar(
            select(GlossaryTerm).where(
                GlossaryTerm.key == payload.key
            )
        )

        if existing:
            raise ValueError(f"Glossary key already exists: {payload.key}")

        term = GlossaryTerm(
            key=payload.key,
            definition=payload.definition,
            context=payload.context,
            preferred=payload.preferred,
            deprecated=payload.deprecated,
        )

        db.add(term)
        db.flush()

        for translation in payload.translations:
            db.add(
                GlossaryTermLocale(
                    term_id=term.id,
                    locale_code=translation.locale_code,
                    term=translation.term,
                    synonyms=", ".join(translation.synonyms) if translation.synonyms else None,
                )
            )

        db.commit()
        db.refresh(term)
        return term

    def list(
        self,
        db: Session,
    ) -> list[GlossaryTerm]:
        return list(
            db.scalars(
                select(GlossaryTerm).order_by(GlossaryTerm.key)
            )
        )

    def get(
        self,
        db: Session,
        term_id: int,
    ) -> GlossaryTerm | None:
        return db.scalar(
            select(GlossaryTerm).where(GlossaryTerm.id == term_id)
        )

    def update(
        self,
        db: Session,
        term_id: int,
        payload: GlossaryUpdate,
    ) -> GlossaryTerm:
        term = self.get(db, term_id)
        if term is None:
            raise ValueError(f"Glossary term {term_id} not found.")

        if payload.definition is not None:
            term.definition = payload.definition
        if payload.context is not None:
            term.context = payload.context
        if payload.preferred is not None:
            term.preferred = payload.preferred
        if payload.deprecated is not None:
            term.deprecated = payload.deprecated

        if payload.translations is not None:
            # Delete existing translations and replace
            db.execute(
                delete(GlossaryTermLocale).where(
                    GlossaryTermLocale.term_id == term.id
                )
            )
            for translation in payload.translations:
                db.add(
                    GlossaryTermLocale(
                        term_id=term.id,
                        locale_code=translation.locale_code,
                        term=translation.term,
                        synonyms=", ".join(translation.synonyms) if translation.synonyms else None,
                    )
                )

        db.commit()
        db.refresh(term)
        return term

    def delete(
        self,
        db: Session,
        term_id: int,
    ) -> bool:
        term = self.get(db, term_id)
        if term is None:
            return False

        db.delete(term)
        db.commit()
        return True
