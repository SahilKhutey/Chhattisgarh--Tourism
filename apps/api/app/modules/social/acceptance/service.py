from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.events.publisher import create_outbox_event
from app.events.types import EventType
from app.modules.social.acceptance.policies import (
    SocialAcceptancePolicy,
    assert_sync_allowed,
    can_sync,
)
from app.modules.social.acceptance.workflow import (
    ConcurrencyStateConflictError,
    SocialAcceptanceWorkflow,
)
from app.modules.social.domain.enums import SocialAccountStatus
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.repositories.social_account_repository import SocialAccountRepository


class SocialAcceptanceService:
    """Manages editorial acceptance review, approval, rejection, and activation of social accounts."""

    def __init__(
        self,
        session_or_repo: Session | SocialAccountRepository,
        policy: SocialAcceptancePolicy | None = None,
        audit_service: Any = None,
        event_service: Any = None,
    ) -> None:
        if isinstance(session_or_repo, Session):
            self.session = session_or_repo
            self.account_repo = SocialAccountRepository(session_or_repo)
            self.repository = self.account_repo
        else:
            self.repository = session_or_repo
            self.account_repo = session_or_repo
            self.session = getattr(session_or_repo, "session", None) or getattr(session_or_repo, "db", None)

        self.policy = policy or SocialAcceptancePolicy()
        self.audit_service = audit_service
        self.event_service = event_service

    def _resolve_account(self, account_or_id: Any = None, account_id: Any = None) -> SocialAccount:
        target = account_or_id if account_or_id is not None else account_id
        if target is None:
            raise ValueError("An account or account_id must be provided.")
        if isinstance(target, (uuid.UUID, str)):
            account = self.account_repo.get_by_id(
                uuid.UUID(str(target)) if not isinstance(target, uuid.UUID) else target
            )
            if not account:
                raise AppError(
                    code="SOCIAL_ACCOUNT_NOT_FOUND",
                    message=f"Social account '{target}' was not found.",
                    status_code=404,
                )
            return account
        return target

    def submit_for_acceptance(
        self,
        account: Any = None,
        actor_id: Any = None,
        account_id: Any = None,
    ) -> SocialAccount:
        acc = self._resolve_account(account, account_id)
        if not self.policy.can_submit(acc.status):
            raise ValueError("Social account cannot be submitted from its current state.")

        new_status = SocialAcceptanceWorkflow.transition(
            SocialAccountStatus(acc.status),
            SocialAccountStatus.PENDING_ACCEPTANCE,
        )
        acc.status = new_status.value

        if self.audit_service:
            self.audit_service.record(
                action="SOCIAL_ACCOUNT_SUBMITTED",
                entity_type="social_account",
                entity_id=acc.id,
                actor_id=actor_id,
            )

        if self.session:
            create_outbox_event(
                self.session,
                event_type="SOCIAL_ACCOUNT_SUBMITTED",
                aggregate_id=acc.id,
                payload={"account_id": str(acc.id), "creator_id": str(acc.creator_id)},
            )
            self.session.commit()
        return acc

    def submit(
        self,
        account: Any = None,
        actor_id: Any = None,
        account_id: Any = None,
    ) -> SocialAccount:
        return self.submit_for_acceptance(account, actor_id=actor_id, account_id=account_id)

    def accept(
        self,
        account: Any = None,
        actor_id: Any = None,
        reason: str | None = None,
        approved_content_types: list[str] | None = None,
        priority: int | None = None,
        account_id: Any = None,
    ) -> SocialAccount:
        acc = self._resolve_account(account, account_id)
        current = SocialAccountStatus(acc.status)

        # Idempotency rule: if already accepted or active, return without duplicate mutations
        if current in (SocialAccountStatus.ACCEPTED, SocialAccountStatus.ACTIVE):
            return acc

        if not self.policy.can_accept(current):
            raise ValueError("Social account cannot be accepted from its current state.")

        # Transition: VERIFIED / PENDING_ACCEPTANCE -> ACCEPTED
        accepted_status = SocialAcceptanceWorkflow.transition(current, SocialAccountStatus.ACCEPTED)
        acc.status = accepted_status.value

        if approved_content_types is not None:
            acc.content_types_allowed = approved_content_types
        if priority is not None:
            acc.priority = priority

        # Transition ACCEPTED -> ACTIVE
        acc.status = SocialAccountStatus.ACTIVE.value
        acc.sync_enabled = True

        if self.audit_service:
            self.audit_service.record(
                action="SOCIAL_ACCOUNT_ACCEPTED",
                entity_type="social_account",
                entity_id=acc.id,
                actor_id=actor_id,
                details={"reason": reason, "priority": acc.priority},
            )

        if self.session:
            create_outbox_event(
                self.session,
                event_type=EventType.SOCIAL_ACCOUNT_ACCEPTED,
                aggregate_id=acc.id,
                payload={
                    "account_id": str(acc.id),
                    "creator_id": str(acc.creator_id),
                    "platform": str(acc.platform),
                    "handle": acc.handle,
                    "priority": acc.priority,
                    "reason": reason,
                },
            )
            create_outbox_event(
                self.session,
                event_type=EventType.SOCIAL_ACCOUNT_ACTIVATED,
                aggregate_id=acc.id,
                payload={
                    "account_id": str(acc.id),
                    "creator_id": str(acc.creator_id),
                },
            )
            self.session.commit()

        return acc

    def reject(
        self,
        account: Any = None,
        actor_id: Any = None,
        reason: str = "Editorial rejection",
        reason_code: str | None = None,
        account_id: Any = None,
    ) -> SocialAccount:
        if not reason or not str(reason).strip():
            raise ValueError("A rejection reason is required.")

        acc = self._resolve_account(account, account_id)
        current = SocialAccountStatus(acc.status)

        rejected_status = SocialAcceptanceWorkflow.transition(current, SocialAccountStatus.REJECTED)
        acc.status = rejected_status.value
        acc.sync_enabled = False
        acc.last_error = reason.strip()

        if self.audit_service:
            self.audit_service.record(
                action="SOCIAL_ACCOUNT_REJECTED",
                entity_type="social_account",
                entity_id=acc.id,
                actor_id=actor_id,
                details={"reason": reason, "reason_code": reason_code},
            )

        if self.session:
            create_outbox_event(
                self.session,
                event_type="SOCIAL_ACCOUNT_REJECTED",
                aggregate_id=acc.id,
                payload={
                    "account_id": str(acc.id),
                    "creator_id": str(acc.creator_id),
                    "reason": reason,
                    "reason_code": reason_code,
                },
            )
            self.session.commit()

        return acc

    def request_changes(
        self,
        account: Any = None,
        actor_id: Any = None,
        reason: str = "",
        requested_fields: list[str] | None = None,
        account_id: Any = None,
    ) -> SocialAccount:
        if not reason or not str(reason).strip():
            raise ValueError("Reason for requesting changes is required.")

        acc = self._resolve_account(account, account_id)
        current = SocialAccountStatus(acc.status)

        target = SocialAcceptanceWorkflow.transition(current, SocialAccountStatus.PENDING)
        acc.status = target.value
        acc.last_error = f"Changes requested: {reason.strip()}"

        if self.audit_service:
            self.audit_service.record(
                action="SOCIAL_ACCOUNT_CHANGES_REQUESTED",
                entity_type="social_account",
                entity_id=acc.id,
                actor_id=actor_id,
                details={"reason": reason, "requested_fields": requested_fields or []},
            )

        if self.session:
            create_outbox_event(
                self.session,
                event_type="SOCIAL_ACCOUNT_CHANGES_REQUESTED",
                aggregate_id=acc.id,
                payload={
                    "account_id": str(acc.id),
                    "creator_id": str(acc.creator_id),
                    "reason": reason,
                    "requested_fields": requested_fields or [],
                },
            )
            self.session.commit()

        return acc

    def activate(
        self,
        account: Any = None,
        actor_id: Any = None,
        account_id: Any = None,
    ) -> SocialAccount:
        acc = self._resolve_account(account, account_id)
        current = SocialAccountStatus(acc.status)

        sync_enabled = bool(getattr(acc, "sync_enabled", False))
        if not self.policy.can_activate(current, sync_enabled):
            raise ValueError("Social account cannot be activated from its current state.")

        acc.status = SocialAccountStatus.ACTIVE.value

        if self.audit_service:
            self.audit_service.record(
                action="SOCIAL_ACCOUNT_ACTIVATED",
                entity_type="social_account",
                entity_id=acc.id,
                actor_id=actor_id,
            )

        if self.session:
            create_outbox_event(
                self.session,
                event_type=EventType.SOCIAL_ACCOUNT_ACTIVATED,
                aggregate_id=acc.id,
                payload={"account_id": str(acc.id), "creator_id": str(acc.creator_id)},
            )
            self.session.commit()

        return acc

    def pause(
        self,
        account: Any = None,
        actor_id: Any = None,
        account_id: Any = None,
    ) -> SocialAccount:
        acc = self._resolve_account(account, account_id)
        current = SocialAccountStatus(acc.status)

        paused_status = SocialAcceptanceWorkflow.transition(current, SocialAccountStatus.PAUSED)
        acc.status = paused_status.value
        acc.sync_enabled = False

        if self.audit_service:
            self.audit_service.record(
                action="SOCIAL_ACCOUNT_PAUSED",
                entity_type="social_account",
                entity_id=acc.id,
                actor_id=actor_id,
            )

        if self.session:
            create_outbox_event(
                self.session,
                event_type=EventType.SOCIAL_ACCOUNT_PAUSED,
                aggregate_id=acc.id,
                payload={
                    "account_id": str(acc.id),
                    "creator_id": str(acc.creator_id),
                    "platform": str(acc.platform),
                    "handle": acc.handle,
                },
            )
            self.session.commit()
        return acc

    def reactivate(
        self,
        account: Any = None,
        actor_id: Any = None,
        account_id: Any = None,
    ) -> SocialAccount:
        acc = self._resolve_account(account, account_id)
        current = SocialAccountStatus(acc.status)

        active_status = SocialAcceptanceWorkflow.transition(current, SocialAccountStatus.ACTIVE)
        acc.status = active_status.value
        acc.sync_enabled = True

        if self.audit_service:
            self.audit_service.record(
                action="SOCIAL_ACCOUNT_ACTIVATED",
                entity_type="social_account",
                entity_id=acc.id,
                actor_id=actor_id,
            )

        if self.session:
            create_outbox_event(
                self.session,
                event_type=EventType.SOCIAL_ACCOUNT_ACTIVATED,
                aggregate_id=acc.id,
                payload={
                    "account_id": str(acc.id),
                    "creator_id": str(acc.creator_id),
                    "platform": str(acc.platform),
                    "handle": acc.handle,
                },
            )
            self.session.commit()
        return acc

    def can_sync(self, account: Any = None, account_id: Any = None) -> bool:
        acc = self._resolve_account(account, account_id)
        return can_sync(acc)

    def assert_sync_allowed(self, account: Any = None, account_id: Any = None) -> None:
        acc = self._resolve_account(account, account_id)
        assert_sync_allowed(acc)


__all__ = ["SocialAcceptanceService"]
