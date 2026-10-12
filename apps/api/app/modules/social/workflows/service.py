from __future__ import annotations

import uuid
from typing import Any
from sqlalchemy.orm import Session

from app.modules.social.audit.service import SocialAuditService
from app.modules.social.events.publisher import SocialEventPublisher
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.sync.coordinator import SocialSyncCoordinator
from app.modules.social.sync.locking import SocialSyncLock, get_social_sync_lock
from app.modules.social.workflows.acceptance_workflow import AccountAcceptanceWorkflow
from app.modules.social.workflows.account_workflow import SocialAccountWorkflow
from app.modules.social.workflows.content_workflow import ContentValidationWorkflow
from app.modules.social.workflows.creator_workflow import CreatorWorkflow
from app.modules.social.workflows.moderation_workflow import ContentModerationWorkflow
from app.modules.social.workflows.publication_workflow import ContentPublicationWorkflow
from app.modules.social.workflows.sync_workflow import SocialSyncWorkflow
from app.modules.social.workflows.tourism_context_workflow import TourismContextWorkflow
from app.modules.social.workflows.verification_workflow import AccountVerificationWorkflow


class SocialWorkflowService:
    """
    Central composable workflow orchestrator for Social Engine Phase 9.
    Unites all individual domain workflows under a single injection interface.
    Sections 9.74, 9.75.
    """

    def __init__(
        self,
        session: Session,
        provider_registry: ProviderRegistry | None = None,
        lock: SocialSyncLock | None = None,
    ) -> None:
        self.session = session
        self.publisher = SocialEventPublisher(session)
        self.audit = SocialAuditService(session)
        self.providers = provider_registry or ProviderRegistry.default()
        self.lock = lock or get_social_sync_lock()
        self.coordinator = SocialSyncCoordinator(
            session=session,
            lock=self.lock,
            provider_registry=self.providers,
        )

        # Composed Workflows
        self.creators = CreatorWorkflow(session, self.publisher, self.audit)
        self.accounts = SocialAccountWorkflow(session, self.publisher, self.audit)
        self.verification = AccountVerificationWorkflow(session, self.providers, self.publisher, self.audit)
        self.acceptance = AccountAcceptanceWorkflow(session, self.publisher, self.audit)
        self.sync = SocialSyncWorkflow(session, self.coordinator, self.lock, self.publisher, self.audit)
        self.content = ContentValidationWorkflow(session, self.publisher, self.audit)
        self.moderation = ContentModerationWorkflow(session, self.publisher, self.audit)
        self.publication = ContentPublicationWorkflow(session, self.publisher, self.audit)
        self.tourism = TourismContextWorkflow(session, self.publisher, self.audit)

    # ── High-Level Orchestrated Composite Operations ───────────────────────

    def onboard_and_verify_account(
        self,
        *,
        creator_id: uuid.UUID,
        raw_input: str,
        platform_hint: str | None = None,
        actor_id: str | None = None,
        auto_verify: bool = True,
    ) -> SocialAccount:
        """Registers social handle and triggers provider verification."""
        account = self.accounts.register_account(
            creator_id=creator_id,
            raw_input=raw_input,
            platform_hint=platform_hint,
            actor_id=actor_id,
        )
        if auto_verify:
            account = self.verification.verify_account(account.id, actor_id=actor_id)
        return account

    def approve_and_publish_content(
        self,
        content_id: uuid.UUID,
        actor_id: str | None = None,
        editorial_note: str | None = None,
    ) -> SocialContent:
        """Executes review approval and immediate public feed publication."""
        content = self.moderation.approve_content(
            content_id, actor_id=actor_id, editorial_note=editorial_note
        )
        return self.publication.publish_content(content.id, actor_id=actor_id)


__all__ = ["SocialWorkflowService"]
