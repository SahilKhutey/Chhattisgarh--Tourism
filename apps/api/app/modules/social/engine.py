from __future__ import annotations

from sqlalchemy.orm import Session

from app.modules.social.acceptance.service import SocialAcceptanceService
from app.modules.social.accounts.service import SocialAccountService
from app.modules.social.audit.service import SocialAuditService
from app.modules.social.content.service import SocialContentService
from app.modules.social.creators.service import CreatorService
from app.modules.social.feed.service import SocialFeedService
from app.modules.social.moderation.service import SocialModerationService
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.sync.service import SocialSyncService


class SocialEngine:
    """Master Social Engine composing all sub-services for pair-programming and modular injection."""

    def __init__(self, session: Session) -> None:
        self.session = session
        self.creators = CreatorService(session)
        self.accounts = SocialAccountService(session)
        self.acceptance = SocialAcceptanceService(session)
        self.content = SocialContentService(session)
        self.sync = SocialSyncService(session)
        self.feed = SocialFeedService(session)
        self.moderation = SocialModerationService(session)
        self.audit = SocialAuditService(session)
        self.providers = ProviderRegistry.default()


__all__ = ["SocialEngine"]
