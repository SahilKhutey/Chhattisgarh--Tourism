from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.events.publisher import create_outbox_event
from app.modules.social.acceptance.policies import can_sync
from app.modules.social.accounts.repository import SocialAccountRepository
from app.modules.social.config import SocialSettings, get_social_settings
from app.modules.social.content.repository import SocialContentRepository
from app.modules.social.domain.enums import (
    SocialPlatform,
    SyncStatus,
)
from app.modules.social.eligibility.service import (
    AccountNotAcceptedError,
    SocialEligibilityService,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.providers.youtube.adapter import YouTubeAdapter
from app.modules.social.providers.youtube.client import YouTubeClient
from app.modules.social.providers.youtube.errors import (
    YouTubeAccountNotFoundError,
    YouTubeProviderError,
    YouTubeQuotaExceededError,
)
from app.modules.social.providers.youtube.mapper import YouTubeContentMapper
from app.modules.social.sync.repository import SocialSyncStateRepository
from app.modules.social.sync.retry import retry_with_backoff
from app.modules.social.sync.state import SyncResult

logger = logging.getLogger(__name__)


class YouTubeSyncService:
    """Production synchronization service for YouTube creator channels via uploads playlist."""

    def __init__(
        self,
        session: Session,
        *,
        client: YouTubeClient | None = None,
        provider: YouTubeAdapter | None = None,
        account_repository: SocialAccountRepository | None = None,
        sync_repository: SocialSyncStateRepository | None = None,
        content_repository: SocialContentRepository | None = None,
        eligibility_service: SocialEligibilityService | None = None,
        mapper: YouTubeContentMapper | None = None,
        settings: SocialSettings | None = None,
        audit_service: Any = None,
    ) -> None:
        self.session = session
        self.settings = settings or get_social_settings()
        self.account_repo = account_repository or SocialAccountRepository(session)
        self.sync_repo = sync_repository or SocialSyncStateRepository(session)
        self.content_repo = content_repository or SocialContentRepository(session)
        self.eligibility_service = eligibility_service or SocialEligibilityService()
        self.mapper = mapper or YouTubeContentMapper()
        self.audit_service = audit_service

        if provider is not None:
            self.provider = provider
            self.client = provider.client or client
        else:
            effective_client = client or (
                YouTubeClient(
                    api_key=self.settings.youtube_api_key or "",
                    base_url=self.settings.youtube_api_base_url,
                    timeout=self.settings.social_youtube_request_timeout_seconds,
                )
                if self.settings.youtube_api_key
                else None
            )
            self.client = effective_client
            self.provider = YouTubeAdapter(client=effective_client)

    def _resolve_account(self, account_or_id: Any) -> SocialAccount:
        if isinstance(account_or_id, (uuid.UUID, str)):
            acc_id = uuid.UUID(str(account_or_id)) if not isinstance(account_or_id, uuid.UUID) else account_or_id
            account = self.account_repo.get_by_id(acc_id)
            if not account:
                raise ValueError(f"SocialAccount '{account_or_id}' was not found.")
            return account
        return account_or_id

    def _parse_checkpoint(self, cursor: str | None) -> tuple[datetime | None, str | None]:
        if not cursor:
            return None, None
        try:
            data = json.loads(cursor)
            pub_str = data.get("last_seen_published_at")
            vid_id = data.get("last_seen_video_id")
            pub_dt = datetime.fromisoformat(pub_str) if pub_str else None
            return pub_dt, vid_id
        except Exception:
            return None, None

    def _format_checkpoint(self, pub_dt: datetime | None, vid_id: str | None) -> str | None:
        if not pub_dt and not vid_id:
            return None
        return json.dumps(
            {
                "last_seen_published_at": pub_dt.isoformat() if pub_dt else None,
                "last_seen_video_id": vid_id,
            }
        )

    async def sync_account(
        self,
        account_or_id: Any,
        *,
        force: bool = False,
    ) -> SyncResult:
        started_at = datetime.now(timezone.utc)
        account = self._resolve_account(account_or_id)

        # 1. Eligibility Check
        creator_stmt = select(Creator).where(Creator.id == account.creator_id)
        creator = self.session.scalar(creator_stmt)
        creator_district_id = creator.district_id if creator and creator.district_id else "bastar"

        is_eligible = force or self.eligibility_service.can_sync(
            account=account,
            creator=creator,
            engine_enabled=True,
        )
        if not is_eligible:
            raise AccountNotAcceptedError(
                f"YouTube account '{account.id}' ({account.handle}) is not eligible for synchronization."
            )

        # 2. Sync state loading
        sync_state = self.sync_repo.get_or_create(account.id)
        sync_state.last_started_at = started_at
        self.session.flush()

        # 3. Determine uploads playlist ID
        meta = dict(account.metadata_json or {})
        yt_meta = dict(meta.get("youtube", {}))
        uploads_playlist_id = yt_meta.get("uploads_playlist_id") or meta.get("uploads_playlist_id")

        try:
            if not uploads_playlist_id:
                channel = await self.provider.get_channel(account.profile_url or account.handle)
                uploads_playlist_id = channel.uploads_playlist_id
                if not uploads_playlist_id:
                    raise YouTubeProviderError(
                        f"Unable to discover uploads playlist for channel '{account.handle}'."
                    )
                # Persist discovered channel metadata into account
                account.external_account_id = account.external_account_id or channel.channel_id
                yt_meta["channel_id"] = channel.channel_id
                yt_meta["uploads_playlist_id"] = uploads_playlist_id
                yt_meta["last_verified_title"] = channel.title
                meta["youtube"] = yt_meta
                account.metadata_json = meta
                self.session.flush()

            # 4. Logical Checkpoint
            last_seen_published_at, last_seen_video_id = (
                (None, None) if force else self._parse_checkpoint(sync_state.cursor)
            )

            # 5. Paginated Upload Discovery via playlistItems.list
            max_pages = min(self.settings.social_youtube_max_pages_per_sync, 20)
            max_results = min(self.settings.social_youtube_max_results, 50)

            collected_video_ids: list[str] = []
            newest_published_at: datetime | None = None
            newest_video_id: str | None = None
            page_token: str | None = None
            hit_checkpoint = False

            if self.client is not None:
                for page_idx in range(max_pages):
                    async def _fetch_page(tok=page_token):
                        return await self.client.get_playlist_items(
                            playlist_id=uploads_playlist_id,
                            page_token=tok,
                            max_results=max_results,
                        )

                    page_payload = await retry_with_backoff(
                        _fetch_page,
                        attempts=self.settings.social_youtube_retry_attempts,
                        base_delay=self.settings.social_youtube_retry_base_delay_seconds,
                    )

                    items = page_payload.get("items", [])
                    if not items:
                        break

                    for item in items:
                        snippet = item.get("snippet", {})
                        content_details = item.get("contentDetails", {})
                        vid_id = content_details.get("videoId") or snippet.get("resourceId", {}).get("videoId")
                        if not vid_id:
                            continue

                        pub_str = snippet.get("publishedAt")
                        pub_dt = None
                        if pub_str:
                            try:
                                pub_dt = datetime.fromisoformat(pub_str.replace("Z", "+00:00"))
                            except Exception:
                                pub_dt = None

                        # Track newest item seen on first page
                        if newest_published_at is None and pub_dt:
                            newest_published_at = pub_dt
                            newest_video_id = vid_id

                        # Incremental stop condition
                        if last_seen_published_at and pub_dt and pub_dt <= last_seen_published_at:
                            hit_checkpoint = True
                            break

                        collected_video_ids.append(vid_id)

                    if hit_checkpoint:
                        logger.info(
                            "YouTube sync reached incremental checkpoint for account %s at page %d",
                            account.id,
                            page_idx + 1,
                        )
                        break

                    page_token = page_payload.get("nextPageToken")
                    if not page_token:
                        break

            # 6. Video Metadata Batch Fetch via videos.list
            discovered_count = len(collected_video_ids)
            created_count = 0
            updated_count = 0
            failed_count = 0

            # Batch process in chunks of 50
            chunk_size = 50
            for i in range(0, len(collected_video_ids), chunk_size):
                chunk = collected_video_ids[i : i + chunk_size]
                if self.client is not None:
                    async def _fetch_batch(c=chunk):
                        return await self.client.get_videos(c)

                    batch_payload = await retry_with_backoff(
                        _fetch_batch,
                        attempts=self.settings.social_youtube_retry_attempts,
                        base_delay=self.settings.social_youtube_retry_base_delay_seconds,
                    )
                    raw_videos = batch_payload.get("items", [])
                else:
                    raw_videos = []

                for raw_video in raw_videos:
                    try:
                        # Normalize & map YouTube data
                        mapped_content = self.mapper.map_video(
                            raw_video,
                            creator_id=account.creator_id,
                            social_account_id=account.id,
                            creator_district_id=creator_district_id,
                        )

                        # Idempotent upsert preserving editorial fields
                        _, is_created = self.content_repo.upsert_provider_content(mapped_content)
                        if is_created:
                            created_count += 1
                        else:
                            updated_count += 1
                    except Exception as err:
                        logger.error("Failed mapping/upserting video item %s: %s", raw_video.get("id"), err)
                        failed_count += 1

            finished_at = datetime.now(timezone.utc)

            # 7. Update Checkpoint Cursor
            next_checkpoint_cursor = (
                self._format_checkpoint(newest_published_at, newest_video_id)
                if newest_published_at
                else sync_state.cursor
            )

            # 8. Record Sync Success in Repository
            self.sync_repo.record_sync_success(
                account_id=account.id,
                discovered=discovered_count,
                created=created_count,
                updated=updated_count,
                failed=failed_count,
                cursor=next_checkpoint_cursor,
                started_at=started_at,
                finished_at=finished_at,
            )

            # 9. Emit Outbox & Audit Events
            create_outbox_event(
                self.session,
                event_type="SOCIAL_CONTENT_SYNCED",
                aggregate_id=account.id,
                payload={
                    "account_id": str(account.id),
                    "platform": "youtube",
                    "discovered": discovered_count,
                    "created": created_count,
                    "updated": updated_count,
                    "failed": failed_count,
                },
            )

            if self.audit_service:
                self.audit_service.record(
                    action="YOUTUBE_SYNC_COMPLETED",
                    entity_type="social_account",
                    entity_id=account.id,
                    details={
                        "discovered": discovered_count,
                        "created": created_count,
                        "updated": updated_count,
                        "duration_ms": int((finished_at - started_at).total_seconds() * 1000),
                    },
                )

            self.session.commit()

            return SyncResult(
                account_id=account.id,
                status=SyncStatus.SUCCEEDED.value,
                discovered=discovered_count,
                created=created_count,
                updated=updated_count,
                failed=failed_count,
                next_cursor=next_checkpoint_cursor,
                started_at=started_at,
                finished_at=finished_at,
            )

        except Exception as exc:
            self.session.rollback()
            finished_at = datetime.now(timezone.utc)
            error_msg = str(exc)

            logger.error("YouTube sync failed for account %s: %s", account.id, exc, exc_info=True)
            self.sync_repo.record_sync_failure(
                account_id=account.id,
                error=error_msg,
                started_at=started_at,
                finished_at=finished_at,
            )
            self.session.commit()

            return SyncResult(
                account_id=account.id,
                status=SyncStatus.FAILED.value,
                discovered=0,
                created=0,
                updated=0,
                failed=1,
                error=error_msg,
                started_at=started_at,
                finished_at=finished_at,
            )


__all__ = ["YouTubeSyncService"]
