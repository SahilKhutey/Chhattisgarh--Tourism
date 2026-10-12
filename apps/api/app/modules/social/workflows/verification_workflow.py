from __future__ import annotations

import logging
import uuid
from typing import Any
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.modules.social.accounts.repository import SocialAccountRepository
from app.modules.social.audit.service import SocialAuditService
from app.modules.social.domain.enums import CreatorStatus, SocialAccountStatus
from app.modules.social.domain.state_machines import SocialAccountStateMachine
from app.modules.social.events.definitions import (
    SocialWorkflowEvent,
    SocialWorkflowEventType,
)
from app.modules.social.events.publisher import SocialEventPublisher
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.workflows.guards import assert_account_verifiable

logger = logging.getLogger(__name__)


def _val(x: Any) -> str:
    return x.value if hasattr(x, "value") else str(x)


class AccountVerificationWorkflow:
    """
    Workflow for verifying social handle identity with provider API.
    Sections 9.13, 9.14.
    """

    def __init__(
        self,
        session: Session,
        provider_registry: ProviderRegistry | None = None,
        publisher: SocialEventPublisher | None = None,
        audit: SocialAuditService | None = None,
    ) -> None:
        self.session = session
        self.repository = SocialAccountRepository(session)
        self.providers = provider_registry or ProviderRegistry.default()
        self.publisher = publisher or SocialEventPublisher(session)
        self.audit = audit or SocialAuditService(session)

    def verify_account(
        self,
        account_id: uuid.UUID,
        actor_id: str | None = None,
    ) -> SocialAccount:
        """
        Executes verification workflow:
        1. Assert state eligibility (PENDING -> VERIFYING)
        2. Query provider adapter
        3. Identity resolved -> VERIFIED, or friendly failure -> PENDING
        """
        account = self.repository.get_by_id(account_id)
        if not account:
            raise AppError(code="ACCOUNT_NOT_FOUND", message=f"Account '{account_id}' not found", status_code=404)

        creator = self.session.get(Creator, account.creator_id)
        if creator and creator.status == CreatorStatus.SUSPENDED:
            raise AppError(
                code="CREATOR_INACTIVE",
                message=f"Creator '{creator.id}' is inactive or suspended; cannot verify account",
                status_code=422,
            )

        assert_account_verifiable(account)

        # 1. Transition to VERIFYING
        account.status = _val(SocialAccountStateMachine.transition(account.status, SocialAccountStatus.VERIFYING))
        self.repository.save(account)

        self.publisher.publish(
            SocialWorkflowEvent(
                event_type=SocialWorkflowEventType.ACCOUNT_VERIFICATION_STARTED,
                aggregate_type="SocialAccount",
                aggregate_id=str(account.id),
                actor_id=actor_id,
            )
        )

        # 2. Call provider adapter
        platform_str = _val(account.platform)
        provider = self.providers.get(platform_str)
        if not provider:
            account.status = SocialAccountStatus.PENDING.value
            self.repository.save(account)
            raise AppError(
                code="PROVIDER_NOT_CONFIGURED",
                message=f"Provider adapter for platform '{platform_str}' is not configured",
                status_code=503,
            )

        try:
            handle_to_verify = account.handle
            result = provider.verify_account(handle_to_verify)
            is_verified = getattr(result, "is_verified", getattr(result, "is_valid", False))
            if is_verified:
                account.status = _val(SocialAccountStateMachine.transition(account.status, SocialAccountStatus.VERIFIED))
                acc_id = getattr(result, "account_id", getattr(result, "provider_channel_id", None))
                if acc_id:
                    account.external_account_id = acc_id
                display_name = getattr(result, "display_name", None)
                if display_name:
                    account.display_name = display_name
                profile_url = getattr(result, "profile_url", None)
                if profile_url:
                    account.profile_url = profile_url

                meta = account.metadata_json or {}
                meta.update({
                    "verified_account_id": acc_id,
                    "verified_title": display_name,
                    "provider_meta": getattr(result, "metadata", {}),
                    "verification_error": None,
                })
                account.metadata_json = meta
                self.repository.save(account)

                # Emit success event + audit
                event = SocialWorkflowEvent(
                    event_type=SocialWorkflowEventType.ACCOUNT_VERIFIED,
                    aggregate_type="SocialAccount",
                    aggregate_id=str(account.id),
                    actor_id=actor_id,
                    metadata={"resolved_name": getattr(result, "display_name", None), "platform_id": acc_id},
                )
                self.publisher.publish(event)
                self.audit.record(
                    action="account.verified",
                    target_type="SocialAccount",
                    target_id=account.id,
                    actor=actor_id,
                    details=event.metadata,
                )
                return account
            else:
                # Friendly error mapping (Section 9.14)
                friendly_message = result.error_message or "The channel or account could not be found."
                account.status = _val(SocialAccountStatus.PENDING)
                meta = account.metadata_json or {}
                meta["verification_error"] = friendly_message
                account.metadata_json = meta
                self.repository.save(account)

                event = SocialWorkflowEvent(
                    event_type=SocialWorkflowEventType.ACCOUNT_VERIFICATION_FAILED,
                    aggregate_type="SocialAccount",
                    aggregate_id=str(account.id),
                    actor_id=actor_id,
                    metadata={"error": friendly_message},
                )
                self.publisher.publish(event)
                self.audit.record(
                    action="account.verification_failed",
                    target_type="SocialAccount",
                    target_id=account.id,
                    actor=actor_id,
                    details={"error": friendly_message},
                )
                raise AppError(code="VERIFICATION_FAILED", message=friendly_message, status_code=422)

        except AppError:
            raise
        except Exception as exc:
            logger.exception("Provider error during verification of account %s: %s", account.id, exc)
            friendly_message = "The verification provider is temporarily unavailable. Please try again later."
            account.status = _val(SocialAccountStatus.PENDING)
            meta = account.metadata_json or {}
            meta["verification_error"] = friendly_message
            account.metadata_json = meta
            self.repository.save(account)

            self.publisher.publish(
                SocialWorkflowEvent(
                    event_type=SocialWorkflowEventType.ACCOUNT_VERIFICATION_FAILED,
                    aggregate_type="SocialAccount",
                    aggregate_id=str(account.id),
                    actor_id=actor_id,
                    metadata={"error": friendly_message},
                )
            )
            raise AppError(code="VERIFICATION_PROVIDER_ERROR", message=friendly_message, status_code=502)


__all__ = ["AccountVerificationWorkflow"]
