from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.modules.content_template.models.template_version import TemplateVersion


class TemplateVersionRepository:

    def list_for_template(
        self,
        db: Session,
        template_id: uuid.UUID | str,
    ) -> Sequence[TemplateVersion]:
        tid = uuid.UUID(str(template_id)) if isinstance(template_id, str) else template_id
        return list(
            db.scalars(
                select(TemplateVersion)
                .where(TemplateVersion.template_id == tid)
                .order_by(TemplateVersion.version_number.desc())
            )
        )

    def get(
        self,
        db: Session,
        version_id: uuid.UUID | str,
    ) -> TemplateVersion | None:
        vid = uuid.UUID(str(version_id)) if isinstance(version_id, str) else version_id
        return db.scalar(
            select(TemplateVersion)
            .options(selectinload(TemplateVersion.fields))
            .where(TemplateVersion.id == vid)
        )

    def get_by_number(
        self,
        db: Session,
        template_id: uuid.UUID | str,
        version_number: int,
    ) -> TemplateVersion | None:
        tid = uuid.UUID(str(template_id)) if isinstance(template_id, str) else template_id
        return db.scalar(
            select(TemplateVersion)
            .options(selectinload(TemplateVersion.fields))
            .where(
                TemplateVersion.template_id == tid,
                TemplateVersion.version_number == version_number,
            )
        )
