from __future__ import annotations

import uuid
from typing import Any
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.modules.social.accounts.repository import SocialAccountRepository
from app.modules.social.audit.service import SocialAuditService
from app.modules.social.domain.enums import SocialAccountStatus, SocialPlatform
from app.modules.social.domain.state_machines import SocialAccountStateMachine
from app.modules.social.events.definitions import (
    SocialWorkflowEvent,
    SocialWorkflowEventType,
)
from app.modules.social.events.publisher import SocialEventPublisher
from app.modules.social.handles.resolver import SocialHandleResolver
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.policies.account_policy import SocialAccountPolicy
from app.modules.social.workflows.guards import assert_creator_editable


def _val(x: Any) -> str:
    return x.value if hasattr(x, "value") else str(x)


class SocialAccountWorkflow:
    """
    Workflow for social handle registration, normalization, duplicate protection,
    and lifecycle transitions (pause, reactivate, disconnect).
    Sections 9.11, 9.12, 9.43, 9.44.
    """

    def __init__(
        self,
        session: Session,
        publisher: SocialEventPublisher | None = None,
        audit: SocialAuditService | None = None,
    ) -> None:
        self.session = session
        self.repository = SocialAccountRepository(session)
        self.publisher = publisher or SocialEventPublisher(session)
        self.audit = audit or SocialAuditService(session)

    def register_account(
        self,
        *,
        creator_id: uuid.UUID,
        raw_input: str,
        platform_hint: str | None = None,
        actor_id: str | None = None,
    ) -> SocialAccount:
        """
        Parses URL or handle, detects platform, normalizes handle, checks duplicates,
        and registers account in PENDING status.
        """
        platform, handle = SocialHandleResolver.resolve(raw_input, platform_hint)
        platform_str = _val(platform)

        # Check duplicate for this platform and handle
        existing = self.repository.get_by_platform_handle(platform, handle)
        if existing:
            raise AppError(
                code="SOCIAL_ACCOUNT_ALREADY_EXISTS",
                message=f"Account '@{handle}' on {platform_str} is already registered to a creator",
                status_code=409,
            )

        account = SocialAccount(
            id=uuid.uuid4(),
            creator_id=creator_id,
            platform=platform_str,
            handle=handle,
            status=SocialAccountStatus.PENDING.value,
            is_sync_enabled=False,
            profile_url=raw_input if raw_input.startswith("http") else f"https://{platform_str.lower()}.com/{handle}",
            display_name=handle,
            metadata_json={
                "raw_input": raw_input,
                "normalized_handle": handle,
            },
        )
        self.repository.save(account)

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.ACCOUNT_REGISTERED,
            aggregate_type="SocialAccount",
            aggregate_id=str(account.id),
            actor_id=actor_id,
            metadata={
                "creator_id": str(creator_id),
                "platform": platform_str,
                "handle": handle,
                "status": _val(account.status),
            },
        )
        self.publisher.publish(event)
        self.audit.record(
            action="account.registered",
            target_type="SocialAccount",
            target_id=account.id,
            actor=actor_id,
            details=event.metadata,
        )
        return account

    def pause_account(
        self,
        account_id: uuid.UUID,
        actor_id: str | None = None,
        reason: str = "",
    ) -> SocialAccount:
        """
        Pauses an active social account (Section 9.44).
        Stops future syncs; existing approved content remains published unless moderation requires removal.
        """
        account = self.repository.get_by_id(account_id)
        if not account:
            raise AppError(code="ACCOUNT_NOT_FOUND", message=f"Account '{account_id}' not found", status_code=404)

        if not SocialAccountPolicy.can_pause(account):
            raise AppError(
                code="ACCOUNT_CANNOT_BE_PAUSED",
                message=f"Account in status '{_val(account.status)}' cannot be paused; must be ACTIVE",
                status_code=400,
            )

        new_status = SocialAccountStateMachine.transition(account.status, SocialAccountStatus.PAUSED)
        account.status = _val(new_status)
        account.sync_enabled = False
        self.repository.save(account)

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.ACCOUNT_PAUSED,
            aggregate_type="SocialAccount",
            aggregate_id=str(account.id),
            actor_id=actor_id,
            metadata={"status": _val(new_status), "reason": reason},
        )
        self.publisher.publish(event)
        self.audit.record(
            action="account.paused",
            target_type="SocialAccount",
            target_id=account.id,
            actor=actor_id,
            details={"reason": reason},
        )
        return account

    def reactivate_account(
        self,
        account_id: uuid.UUID,
        actor_id: str | None = None,
    ) -> SocialAccount:
        """Reactivates a paused account back to ACTIVE with sync re-enabled."""
        account = self.repository.get_by_id(account_id)
        if not account:
            raise AppError(code="ACCOUNT_NOT_FOUND", message=f"Account '{account_id}' not found", status_code=404)

        if not SocialAccountPolicy.can_reactivate(account):
            raise AppError(
                code="ACCOUNT_CANNOT_BE_REACTIVATED",
                message=f"Account in status '{_val(account.status)}' cannot be reactivated; must be PAUSED",
                status_code=400,
            )

        new_status = SocialAccountStateMachine.transition(account.status, SocialAccountStatus.ACTIVE)
        account.status = _val(new_status)
        account.sync_enabled = True
        self.repository.save(account)

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.ACCOUNT_REACTIVATED,
            aggregate_type="SocialAccount",
            aggregate_id=str(account.id),
            actor_id=actor_id,
            metadata={"status": _val(new_status)},
        )
        self.publisher.publish(event)
        self.audit.record(
            action="account.reactivated",
            target_type="SocialAccount",
            target_id=account.id,
            actor=actor_id,
        )
        return account

    def disconnect_account(
        self,
        account_id: uuid.UUID,
        actor_id: str | None = None,
        reason: str = "",
    ) -> SocialAccount:
        """Disconnects account and stops all sync operations (Section 9.43)."""
        account = self.repository.get_by_id(account_id)
        if not account:
            raise AppError(code="ACCOUNT_NOT_FOUND", message=f"Account '{account_id}' not found", status_code=404)

        if not SocialAccountPolicy.can_disconnect(account):
            raise AppError(
                code="ACCOUNT_CANNOT_BE_DISCONNECTED",
                message=f"Account in status '{_val(account.status)}' cannot be disconnected",
                status_code=400,
            )

        new_status = SocialAccountStateMachine.transition(account.status, SocialAccountStatus.DISCONNECTED)
        account.status = _val(new_status)
        account.sync_enabled = False
        self.repository.save(account)

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.ACCOUNT_DISCONNECTED,
            aggregate_type="SocialAccount",
            aggregate_id=str(account.id),
            actor_id=actor_id,
            metadata={"status": _val(new_status), "reason": reason},
        )
        self.publisher.publish(event)
        self.audit.record(
            action="account.disconnected",
            target_type="SocialAccount",
            target_id=account.id,
            actor=actor_id,
            details={"reason": reason},
        )
        return account


__all__ = ["SocialAccountWorkflow"]
