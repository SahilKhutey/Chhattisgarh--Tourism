from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.social.domain.enums import (
    ContentStatus,
    ContentType,
    ContentVisibility,
    CulturalSensitivityLevel,
    LicenseType,
    ModerationStatus,
    SocialAccountStatus,
    SocialPlatform,
    SyncHealthStatus,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.models.social_media import SocialMedia
from app.modules.social.providers.provider_factory import ProviderFactory
from app.modules.social.repositories.social_account_repository import SocialAccountRepository

logger = logging.getLogger(__name__)


class SocialSyncEngine:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.account_repo = SocialAccountRepository(session)

    def sync_account(self, account_id: uuid.UUID) -> dict[str, Any]:
        started_at = datetime.now(timezone.utc)
        account = self.account_repo.get_by_id(account_id)
        if not account:
            return {"status": "FAILED", "error": f"Account '{account_id}' not found"}

        if account.status != SocialAccountStatus.ACTIVE.value or not account.is_sync_enabled:
            return {"status": "SKIPPED", "reason": f"Account is {account.status} (sync_enabled={account.is_sync_enabled})"}

        try:
            creator_stmt = select(Creator).where(Creator.id == account.creator_id)
            creator = self.session.scalar(creator_stmt)

            district_id = creator.district_id if creator and creator.district_id else "bastar"

            provider = ProviderFactory.get_provider(SocialPlatform(account.platform))
            sync_result = provider.fetch_content(
                handle=account.handle,
                cursor=account.sync_cursor,
                limit=account.max_items,
            )

            discovered_count = len(sync_result.items)
            synced_count = 0

            action_label = "Watch on YouTube" if account.platform == SocialPlatform.YOUTUBE.value else "View on Instagram"

            for item in sync_result.items:
                # 1. Creator-level rule check: is this content type permitted?
                if item.content_type.value not in account.content_types_allowed:
                    continue

                # 2. Deduplication check on (provider, provider_content_id)
                stmt = select(SocialContent).where(
                    SocialContent.provider == item.provider.value,
                    SocialContent.provider_content_id == item.provider_content_id,
                )
                existing_content = self.session.scalar(stmt)

                now = datetime.now(timezone.utc)

                if existing_content:
                    # Update engagement and refresh sync timestamp
                    existing_content.views_count = max(existing_content.views_count, item.view_count)
                    existing_content.likes_count = max(existing_content.likes_count, item.like_count)
                    existing_content.synced_at = now
                    synced_count += 1
                else:
                    # Create canonical normalized SocialContent
                    slug = f"{item.provider.value.lower()}-{item.provider_content_id.lower()[:32]}"
                    new_content = SocialContent(
                        creator_id=account.creator_id,
                        social_account_id=account.id,
                        provider=item.provider.value,
                        provider_content_id=item.provider_content_id,
                        source_url=item.source_url,
                        original_platform_action_label=action_label,
                        content_type=item.content_type.value,
                        title=item.title,
                        caption=item.description or "",
                        description=item.description,
                        slug=slug,
                        district_id=district_id,
                        cultural_sensitivity=CulturalSensitivityLevel.STANDARD.value,
                        license_type=LicenseType.ORIGINAL_CREATOR.value,
                        visibility=ContentVisibility.PUBLIC.value,
                        has_sacred_consent=False,
                        moderation_status=ModerationStatus.APPROVED.value,
                        publication_status=ContentStatus.PUBLISHED.value,
                        is_evergreen=True,
                        duration_seconds=item.duration_seconds,
                        aspect_ratio=item.aspect_ratio,
                        views_count=item.view_count,
                        likes_count=item.like_count,
                        published_at=item.published_at,
                        synced_at=now,
                    )
                    self.session.add(new_content)
                    self.session.flush()

                    # Add thumbnail/preview media item
                    if item.thumbnail_url:
                        media = SocialMedia(
                            content_id=new_content.id,
                            media_type="VIDEO" if item.content_type.value in ["VIDEO", "SHORT", "REEL"] else "IMAGE",
                            media_url=item.thumbnail_url,
                            thumbnail_url=item.thumbnail_url,
                            aspect_ratio=item.aspect_ratio,
                            duration_seconds=item.duration_seconds,
                            processing_status="READY",
                        )
                        self.session.add(media)

                    synced_count += 1

            finished_at = datetime.now(timezone.utc)
            account.last_successful_sync = finished_at
            account.last_attempted_sync = finished_at
            account.sync_health = SyncHealthStatus.HEALTHY.value
            account.consecutive_failures = 0
            account.last_error = None
            account.sync_cursor = sync_result.next_cursor

            self.account_repo.record_sync_run(
                account_id=account.id,
                status="SUCCESS",
                items_discovered=discovered_count,
                items_synced=synced_count,
                started_at=started_at,
                finished_at=finished_at,
            )

            self.session.commit()
            return {
                "status": "SUCCESS",
                "account_id": str(account.id),
                "items_discovered": discovered_count,
                "items_synced": synced_count,
            }

        except Exception as e:
            logger.exception("Failed to sync account %s: %s", account_id, e)
            finished_at = datetime.now(timezone.utc)
            account.last_attempted_sync = finished_at
            account.sync_health = SyncHealthStatus.ERROR.value
            account.consecutive_failures += 1
            account.last_error = str(e)

            self.account_repo.record_sync_run(
                account_id=account.id,
                status="FAILED",
                items_discovered=0,
                items_synced=0,
                started_at=started_at,
                finished_at=finished_at,
                error_message=str(e),
            )
            self.session.commit()
            return {"status": "FAILED", "error": str(e)}

    def sync_all_active_accounts(self) -> list[dict[str, Any]]:
        accounts = self.account_repo.list_active_accounts_for_sync()
        results = []
        for acc in accounts:
            res = self.sync_account(acc.id)
            results.append(res)
        return results
