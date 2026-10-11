from __future__ import annotations

from sqlalchemy.orm import Session

from app.modules.social.acceptance.service import SocialAcceptanceService
from app.modules.social.accounts.service import SocialAccountService
from app.modules.social.audit.service import SocialAuditService
from app.modules.social.content.service import SocialContentService
from app.modules.social.creators.duplicate import CreatorDuplicateService
from app.modules.social.creators.service import CreatorService
from app.modules.social.eligibility.service import SocialEligibilityService
from app.modules.social.feed.service import SocialFeedService
from app.modules.social.handles.service import SocialHandleService
from app.modules.social.moderation.service import SocialModerationService
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.sync.circuit_breaker import ProviderCircuitBreaker
from app.modules.social.sync.coordinator import SocialSyncCoordinator
from app.modules.social.sync.instagram_sync import InstagramSyncService
from app.modules.social.sync.locking import get_social_sync_lock
from app.modules.social.sync.repository import (
    SocialSyncRunRepository,
    SocialSyncStateRepository,
)
from app.modules.social.sync.scheduler import SocialSyncScheduler
from app.modules.social.sync.service import SocialSyncService
from app.modules.social.sync.worker import SocialSyncWorker
from app.modules.social.sync.youtube_sync import YouTubeSyncService
from app.modules.social.verification.service import (
    CreatorVerificationService,
    SocialVerificationService,
)


class SocialEngine:
    """Master Social Engine composing all sub-services for modular injection."""

    def __init__(self, session: Session) -> None:
        self.session = session
        self.providers = ProviderRegistry.default()
        self.circuit_breaker = ProviderCircuitBreaker()
        self.lock = get_social_sync_lock()

        self.audit = SocialAuditService(session)
        self.creators = CreatorService(session)
        self.accounts = SocialAccountService(session)
        self.handles = SocialHandleService(session)
        self.acceptance = SocialAcceptanceService(session, audit_service=self.audit)
        self.verification = SocialVerificationService(self.providers, self.accounts.account_repo, audit_service=self.audit)
        self.creator_verification = CreatorVerificationService(self.creators.creator_repo, audit_service=self.audit)
        self.eligibility = SocialEligibilityService()
        self.duplicate = CreatorDuplicateService(self.creators.creator_repo)
        self.content = SocialContentService(session)

        # Repositories for state & run logs
        self.sync_states = SocialSyncStateRepository(session)
        self.sync_runs = SocialSyncRunRepository(session)

        # Sync orchestrator & workers
        self.coordinator = SocialSyncCoordinator(
            session=session,
            lock=self.lock,
            provider_registry=self.providers,
            circuit_breaker=self.circuit_breaker,
        )
        self.worker = SocialSyncWorker(self.coordinator)
        self.scheduler = SocialSyncScheduler(session, coordinator=self.coordinator)

        # Provider-specific & legacy sync services
        self.sync = SocialSyncService(session)
        self.youtube_sync = YouTubeSyncService(session, audit_service=self.audit)
        self.instagram_sync = InstagramSyncService(session, audit_service=self.audit)
        self.feed = SocialFeedService(session)
        self.moderation = SocialModerationService(session)


__all__ = ["SocialEngine"]
