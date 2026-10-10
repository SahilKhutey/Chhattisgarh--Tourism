from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Sequence

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.modules.social.models.verification import SocialAccountVerification


class SocialVerificationRepository:
    """Repository for SocialAccountVerification persistence operations."""

    def __init__(self, session: Session) -> None:
        self.session = session
        self.db = session

    def create(self, verification: SocialAccountVerification) -> SocialAccountVerification:
        self.session.add(verification)
        self.session.flush()
        return verification

    def record_verification(
        self,
        social_account_id: uuid.UUID,
        status: str,
        provider_account_id: str | None = None,
        provider_handle: str | None = None,
        provider_display_name: str | None = None,
        verified_at: datetime | None = None,
        details: dict[str, Any] | None = None,
    ) -> SocialAccountVerification:
        verification = SocialAccountVerification(
            social_account_id=social_account_id,
            status=status,
            provider_account_id=provider_account_id,
            provider_handle=provider_handle,
            provider_display_name=provider_display_name,
            verified_at=verified_at or datetime.now(timezone.utc),
            details=details or {},
        )
        self.session.add(verification)
        self.session.flush()
        return verification

    def get_by_id(self, verification_id: uuid.UUID) -> SocialAccountVerification | None:
        stmt = select(SocialAccountVerification).where(SocialAccountVerification.id == verification_id)
        return self.session.scalar(stmt)

    def get_history(
        self,
        social_account_id: uuid.UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> Sequence[SocialAccountVerification]:
        stmt = (
            select(SocialAccountVerification)
            .where(SocialAccountVerification.social_account_id == social_account_id)
            .order_by(desc(SocialAccountVerification.created_at))
            .limit(limit)
            .offset(offset)
        )
        return list(self.session.scalars(stmt).all())

    def get_latest(self, social_account_id: uuid.UUID) -> SocialAccountVerification | None:
        stmt = (
            select(SocialAccountVerification)
            .where(SocialAccountVerification.social_account_id == social_account_id)
            .order_by(desc(SocialAccountVerification.created_at))
            .limit(1)
        )
        return self.session.scalar(stmt)


VerificationRepository = SocialVerificationRepository

__all__ = ["SocialVerificationRepository", "VerificationRepository"]
