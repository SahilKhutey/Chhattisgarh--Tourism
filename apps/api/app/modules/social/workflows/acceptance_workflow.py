from __future__ import annotations

import uuid
from typing import Any
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.modules.social.accounts.repository import SocialAccountRepository
from app.modules.social.audit.service import SocialAuditService
from app.modules.social.domain.enums import SocialAccountStatus
from app.modules.social.domain.state_machines import SocialAccountStateMachine
from app.modules.social.events.definitions import (
    SocialWorkflowEvent,
    SocialWorkflowEventType,
)
from app.modules.social.events.publisher import SocialEventPublisher
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.workflows.guards import (
    assert_account_acceptance_allowed,
)


def _val(x: Any) -> str:
    return x.value if hasattr(x, "value") else str(x)


class AccountAcceptanceWorkflow:
    """
    Workflow for editorial acceptance and operational activation of verified accounts.
    Sections 9.15, 9.16.
    Enforces critical invariant: ACCEPTED != ACTIVE.
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

    def accept_account(
        self,
        account_id: uuid.UUID,
        actor_id: str | None = None,
        editorial_note: str | None = None,
    ) -> SocialAccount:
        """
        Editorial decision: marks account as ACCEPTED.
        Account is now approved for creator inclusion, but NOT YET active for synchronization.
        """
        account = self.repository.get_by_id(account_id)
        if not account:
            raise AppError(code="ACCOUNT_NOT_FOUND", message=f"Account '{account_id}' not found", status_code=404)

        assert_account_acceptance_allowed(account)

        new_status = SocialAccountStateMachine.transition(account.status, SocialAccountStatus.ACCEPTED)
        account.status = _val(new_status)
        meta = account.metadata_json or {}
        if editorial_note:
            meta["editorial_note"] = editorial_note
        account.metadata_json = meta
        self.repository.save(account)

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.ACCOUNT_ACCEPTED,
            aggregate_type="SocialAccount",
            aggregate_id=str(account.id),
            actor_id=actor_id,
            metadata={"status": _val(new_status), "note": editorial_note},
        )
        self.publisher.publish(event)
        self.audit.record(
            action="account.accepted",
            target_type="SocialAccount",
            target_id=account.id,
            actor=actor_id,
            details=event.metadata,
        )
        return account

    def reject_account(
        self,
        account_id: uuid.UUID,
        actor_id: str | None = None,
        reason: str = "Does not meet editorial guidelines",
    ) -> SocialAccount:
        """Editorial rejection of an account."""
        account = self.repository.get_by_id(account_id)
        if not account:
            raise AppError(code="ACCOUNT_NOT_FOUND", message=f"Account '{account_id}' not found", status_code=404)

        new_status = SocialAccountStateMachine.transition(account.status, SocialAccountStatus.REJECTED)
        account.status = _val(new_status)
        account.sync_enabled = False
        meta = account.metadata_json or {}
        meta["rejection_reason"] = reason
        account.metadata_json = meta
        self.repository.save(account)

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.ACCOUNT_REJECTED,
            aggregate_type="SocialAccount",
            aggregate_id=str(account.id),
            actor_id=actor_id,
            metadata={"reason": reason},
        )
        self.publisher.publish(event)
        self.audit.record(
            action="account.rejected",
            target_type="SocialAccount",
            target_id=account.id,
            actor=actor_id,
            details={"reason": reason},
        )
        return account

    def activate_account(
        self,
        account_id: uuid.UUID,
        actor_id: str | None = None,
        enable_sync: bool = True,
    ) -> SocialAccount:
        """
        Operational decision: transitions ACCEPTED -> ACTIVE.
        Enables synchronization on the account.
        """
        account = self.repository.get_by_id(account_id)
        if not account:
            raise AppError(code="ACCOUNT_NOT_FOUND", message=f"Account '{account_id}' not found", status_code=404)

        status_norm = _val(account.status).lower()
        if status_norm not in ("accepted", "paused"):
            raise AppError(
                code="ACCOUNT_CANNOT_BE_ACTIVATED",
                message=f"Account in status '{status_norm}' cannot be activated; must be ACCEPTED first",
                status_code=400,
            )

        new_status = SocialAccountStateMachine.transition(account.status, SocialAccountStatus.ACTIVE)
        account.status = _val(new_status)
        account.sync_enabled = enable_sync
        self.repository.save(account)

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.ACCOUNT_ACTIVATED,
            aggregate_type="SocialAccount",
            aggregate_id=str(account.id),
            actor_id=actor_id,
            metadata={"status": _val(new_status), "sync_enabled": enable_sync},
        )
        self.publisher.publish(event)
        self.audit.record(
            action="account.activated",
            target_type="SocialAccount",
            target_id=account.id,
            actor=actor_id,
            details=event.metadata,
        )
        return account

    def set_sync_enabled(
        self,
        account_id: uuid.UUID,
        enabled: bool,
        actor_id: str | None = None,
    ) -> SocialAccount:
        """Toggles synchronization flag on an active account."""
        account = self.repository.get_by_id(account_id)
        if not account:
            raise AppError(code="ACCOUNT_NOT_FOUND", message=f"Account '{account_id}' not found", status_code=404)

        account.sync_enabled = enabled
        self.repository.save(account)

        self.audit.record(
            action="account.sync_toggled",
            target_type="SocialAccount",
            target_id=account.id,
            actor=actor_id,
            details={"sync_enabled": enabled},
        )
        return account


__all__ = ["AccountAcceptanceWorkflow"]
