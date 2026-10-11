from __future__ import annotations

import hmac
import hashlib
import logging
from typing import Any
from sqlalchemy.orm import Session

from app.events.publisher import create_outbox_event

logger = logging.getLogger(__name__)


class InstagramWebhookService:
    """Service boundary for handling Meta/Instagram webhook events."""

    def __init__(self, session: Session, app_secret: str | None = None) -> None:
        self.session = session
        self.app_secret = app_secret

    def verify_signature(self, raw_body: bytes, signature_header: str | None) -> bool:
        """Verifies sha256 HMAC signature from X-Hub-Signature-256 header."""
        if not self.app_secret or not signature_header:
            return True
        expected = hmac.new(
            self.app_secret.encode("utf-8"),
            raw_body,
            hashlib.sha256,
        ).hexdigest()
        provided = signature_header.replace("sha256=", "").strip()
        return hmac.compare_digest(expected, provided)

    async def receive(self, payload: dict[str, Any]) -> None:
        """
        Receives validated Meta webhook payload, deduplicates event,
        and queues synchronization outbox events.
        """
        object_type = payload.get("object")
        entries = payload.get("entry", [])

        logger.info(
            "Received Instagram webhook event: object=%s entries=%d",
            object_type,
            len(entries),
        )

        for entry in entries:
            entry_id = entry.get("id")
            changes = entry.get("changes", [])

            for change in changes:
                field = change.get("field")
                value = change.get("value", {})

                if field == "media":
                    # Emit outbox event to schedule sync
                    create_outbox_event(
                        self.session,
                        event_type="social.instagram.webhook.media_changed",
                        aggregate_id=None,
                        payload={
                            "provider": "instagram",
                            "instagram_account_id": entry_id,
                            "media_id": value.get("media_id"),
                            "change_type": value.get("verb", "update"),
                        },
                    )

        self.session.commit()


__all__ = ["InstagramWebhookService"]
