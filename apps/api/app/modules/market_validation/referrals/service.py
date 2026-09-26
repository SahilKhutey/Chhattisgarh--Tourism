from __future__ import annotations

import secrets
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.modules.market_validation.referrals.models import MarketReferral
from app.modules.market_validation.referrals.repository import ReferralRepository
from app.modules.market_validation.referrals.schemas import (
    ReferralCreate,
    ReferralActivateRequest,
    ReferralResponse,
    ReferralStatusResponse,
    ReferralFunnelMetrics,
    VALID_REFERRAL_CHANNELS,
)


class ReferralService:
    def __init__(self, repo: ReferralRepository | None = None):
        self.repo = repo or ReferralRepository()

    def create_referral(self, db: Session, payload: ReferralCreate) -> ReferralResponse:
        channel = payload.referral_channel.upper()
        if channel not in VALID_REFERRAL_CHANNELS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid referral_channel '{payload.referral_channel}'. Must be one of {sorted(VALID_REFERRAL_CHANNELS)}",
            )

        code = payload.referral_code or f"CG-{secrets.token_hex(4).upper()}"
        existing = self.repo.get_by_code(db, code)
        if existing:
            code = f"CG-{secrets.token_hex(4).upper()}"

        referral = MarketReferral(
            referrer_id=payload.referrer_id,
            referral_code=code,
            referral_channel=channel,
            trip_id=payload.trip_id,
            destination_id=payload.destination_id,
            context_type=payload.context_type.upper(),
            metadata_json=payload.metadata or {},
        )
        saved = self.repo.create(db, referral)
        return ReferralResponse.model_validate(saved)

    def get_referral(self, db: Session, referral_id_or_code: str) -> ReferralResponse:
        referral = self.repo.get_by_id(db, referral_id_or_code) or self.repo.get_by_code(db, referral_id_or_code)
        if not referral:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Referral '{referral_id_or_code}' not found.",
            )
        return ReferralResponse.model_validate(referral)

    def activate_referral(self, db: Session, referral_id_or_code: str, payload: ReferralActivateRequest) -> ReferralResponse:
        referral = self.repo.get_by_id(db, referral_id_or_code) or self.repo.get_by_code(db, referral_id_or_code)
        if not referral:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Referral '{referral_id_or_code}' not found.",
            )

        now = datetime.now(timezone.utc)
        referral.recipient_anonymous_id = payload.recipient_anonymous_id

        if payload.action == "VISIT":
            if not referral.first_visit_at:
                referral.first_visit_at = now
            if referral.status == "CREATED":
                referral.status = "OPENED"
        elif payload.action == "ACTIVATED":
            referral.activated_at = now
            referral.status = "ACTIVATED"
        elif payload.action == "TRIP_CREATED":
            referral.trip_created_at = now
            referral.status = "ACTIVATED"
        elif payload.action == "CONVERTED":
            referral.converted_at = now
            referral.status = "CONVERTED"

        updated = self.repo.update(db, referral)
        return ReferralResponse.model_validate(updated)

    def get_status(self, db: Session, referral_id_or_code: str) -> ReferralStatusResponse:
        res = self.get_referral(db, referral_id_or_code)
        return ReferralStatusResponse(
            id=res.id,
            referral_code=res.referral_code,
            status=res.status,
            recipient_anonymous_id=res.recipient_anonymous_id,
            activated=res.status in {"ACTIVATED", "CONVERTED"},
        )

    def get_funnel_metrics(self, db: Session) -> ReferralFunnelMetrics:
        total, all_refs = self.repo.list(db, limit=10000)
        opened = [r for r in all_refs if r.status in {"OPENED", "ACTIVATED", "CONVERTED"} or r.first_visit_at]
        activated = [r for r in all_refs if r.status in {"ACTIVATED", "CONVERTED"} or r.activated_at]
        trips_created = [r for r in all_refs if r.trip_created_at is not None]
        converted = [r for r in all_refs if r.status == "CONVERTED" or r.converted_at]

        tot = max(1, total) if total > 0 else 1
        open_count = len(opened)
        act_count = len(activated)
        conv_count = len(converted)

        return ReferralFunnelMetrics(
            total_shares=total,
            links_opened=open_count,
            activated_users=act_count,
            trips_created_from_referral=len(trips_created),
            conversions=conv_count,
            share_open_rate=round(open_count / tot, 4) if total > 0 else 0.0,
            activation_rate=round(act_count / max(1, open_count), 4) if open_count > 0 else 0.0,
            conversion_rate=round(conv_count / tot, 4) if total > 0 else 0.0,
        )
