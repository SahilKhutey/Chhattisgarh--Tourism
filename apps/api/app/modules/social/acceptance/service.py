from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.events.publisher import create_outbox_event
from app.events.types import EventType
from app.modules.social.acceptance.policies import assert_sync_allowed, can_sync
from app.modules.social.domain.enums import SocialAccountStatus
from app.modules.social.domain.state_machines import SocialAccountStateMachine
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.repositories.social_account_repository import SocialAccountRepository


class SocialAcceptanceService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.account_repo = SocialAccountRepository(session)

    def _get_account_or_404(self, account_id: uuid.UUID) -> SocialAccount:
        account = self.account_repo.get_by_id(account_id)
        if not account:
            raise AppError(
                code="SOCIAL_ACCOUNT_NOT_FOUND",
                message=f"Social account '{account_id}' was not found.",
                status_code=404,
            )
        return account

    def submit_for_acceptance(self, account_id: uuid.UUID) -> SocialAccount:
        account = self._get_account_or_404(account_id)
        current = SocialAccountStatus(account.status)
        new_status = SocialAccountStateMachine.transition(current, SocialAccountStatus.PENDING_ACCEPTANCE)
        account.status = new_status.value
        self.session.commit()
        return account

    def accept(
        self,
        account_id: uuid.UUID,
        approved_content_types: list[str] | None = None,
        priority: int | None = None,
    ) -> SocialAccount:
        account = self._get_account_or_404(account_id)
        current = SocialAccountStatus(account.status)

        # Transition: VERIFIED / PENDING_ACCEPTANCE -> ACCEPTED
        accepted_status = SocialAccountStateMachine.transition(current, SocialAccountStatus.ACCEPTED)
        account.status = accepted_status.value

        if approved_content_types is not None:
            account.content_types_allowed = approved_content_types
        if priority is not None:
            account.priority = priority

        # Direct transition: ACCEPTED -> ACTIVE
        active_status = SocialAccountStateMachine.transition(SocialAccountStatus.ACCEPTED, SocialAccountStatus.ACTIVE)
        account.status = active_status.value
        account.sync_enabled = True

        create_outbox_event(
            self.session,
            event_type=EventType.SOCIAL_ACCOUNT_ACCEPTED,
            aggregate_id=account.id,
            payload={
                "account_id": str(account.id),
                "creator_id": str(account.creator_id),
                "platform": account.platform,
                "handle": account.handle,
                "priority": account.priority,
            },
        )

        self.session.commit()
        return account

    def reject(self, account_id: uuid.UUID, reason: str | None = None) -> SocialAccount:
        account = self._get_account_or_404(account_id)
        current = SocialAccountStatus(account.status)

        rejected_status = SocialAccountStateMachine.transition(current, SocialAccountStatus.REJECTED)
        account.status = rejected_status.value
        account.sync_enabled = False
        if reason:
            account.last_error = reason

        self.session.commit()
        return account

    def pause(self, account_id: uuid.UUID) -> SocialAccount:
        account = self._get_account_or_404(account_id)
        current = SocialAccountStatus(account.status)

        paused_status = SocialAccountStateMachine.transition(current, SocialAccountStatus.PAUSED)
        account.status = paused_status.value
        account.sync_enabled = False

        create_outbox_event(
            self.session,
            event_type=EventType.SOCIAL_ACCOUNT_PAUSED,
            aggregate_id=account.id,
            payload={
                "account_id": str(account.id),
                "creator_id": str(account.creator_id),
                "platform": account.platform,
                "handle": account.handle,
            },
        )

        self.session.commit()
        return account

    def reactivate(self, account_id: uuid.UUID) -> SocialAccount:
        account = self._get_account_or_404(account_id)
        current = SocialAccountStatus(account.status)

        active_status = SocialAccountStateMachine.transition(current, SocialAccountStatus.ACTIVE)
        account.status = active_status.value
        account.sync_enabled = True

        create_outbox_event(
            self.session,
            event_type=EventType.SOCIAL_ACCOUNT_ACTIVATED,
            aggregate_id=account.id,
            payload={
                "account_id": str(account.id),
                "creator_id": str(account.creator_id),
                "platform": account.platform,
                "handle": account.handle,
            },
        )

        self.session.commit()
        return account

    def can_sync(self, account: SocialAccount) -> bool:
        return can_sync(account)

    def assert_sync_allowed(self, account: SocialAccount) -> None:
        assert_sync_allowed(account)
