from __future__ import annotations

import inspect
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from app.modules.social.domain.enums import SocialPlatform
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.providers.base import (
    ProviderCapabilities,
    SocialAccountProfile,
    SocialProvider,
)
from app.modules.social.providers.instagram.client import InstagramClient
from app.modules.social.providers.instagram.credentials import (
    InstagramCredentialService,
)
from app.modules.social.providers.instagram.errors import (
    InstagramAccountNotFoundError,
    InstagramAuthenticationError,
    InstagramAuthorizationError,
    InstagramMediaNotFoundError,
    InstagramProviderError,
)
from app.modules.social.providers.instagram.models import (
    AccountCapabilities,
    InstagramAccountInfo,
    InstagramMedia,
    InstagramMediaPage,
)
from app.modules.social.providers.instagram.parser import (
    instagram_permalink,
    instagram_profile_url,
    parse_instagram_profile,
)

logger = logging.getLogger(__name__)


class InstagramAdapter(SocialProvider):
    """Adapter bridging official Meta/Instagram Graph API with CG Tourism Social Engine."""

    platform = SocialPlatform.INSTAGRAM

    def __init__(
        self,
        client: InstagramClient | None = None,
        credential_service: InstagramCredentialService | None = None,
    ) -> None:
        self.client = client
        self.credential_service = credential_service

    def capabilities(self) -> ProviderCapabilities:
        return ProviderCapabilities(
            supports_posts=True,
            supports_reels=True,
            supports_shorts=False,
            supports_videos=True,
            supports_stories=False,
            supports_embeds=True,
        )

    def get_account_capabilities(self, account: SocialAccount) -> AccountCapabilities:
        """Determines capabilities of the connected authorized account."""
        meta = dict(account.metadata_json or {})
        ig_meta = dict(meta.get("instagram", {}))
        caps = ig_meta.get("capabilities", {})

        return AccountCapabilities(
            can_read_media=caps.get("media_read", True),
            can_read_reels=caps.get("reels_read", True),
            can_read_insights=caps.get("insights_read", False),
            can_receive_webhooks=caps.get("webhooks_read", False),
        )

    async def get_account_info(
        self,
        account_id: uuid.UUID,
        handle_or_url: str,
    ) -> InstagramAccountInfo:
        """Fetches account info via Graph API or offline mock fallback."""
        username = parse_instagram_profile(handle_or_url)

        if self.client is None:
            # Offline test mode fallback
            return InstagramAccountInfo(
                provider_account_id=f"1784_{username}",
                username=username,
                name=f"{username.replace('_', ' ').title()} CG",
                biography=f"Official Instagram creator @{username} for Bastar tourism.",
                profile_picture_url=f"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
                followers_count=12000,
                media_count=45,
                raw_metadata={"account_type": "BUSINESS"},
            )

        # In production Meta Graph API, look up via business account ID or authorized me endpoint
        payload = await self.client.get_account_info(account_id, f"1784_{username}")
        return InstagramAccountInfo(
            provider_account_id=payload.get("id", f"1784_{username}"),
            username=payload.get("username", username),
            name=payload.get("name"),
            profile_picture_url=payload.get("profile_picture_url"),
            biography=payload.get("biography"),
            followers_count=int(payload.get("followers_count", 0)),
            media_count=int(payload.get("media_count", 0)),
            raw_metadata=payload,
        )

    def verify_account(self, handle_or_url: str) -> SocialAccountProfile:
        """Synchronous wrapper for account verification."""
        res = self.verify_account_async(handle_or_url)
        if inspect.isawaitable(res):
            import asyncio
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    import concurrent.futures
                    with concurrent.futures.ThreadPoolExecutor() as pool:
                        return pool.submit(asyncio.run, res).result()
                else:
                    return loop.run_until_complete(res)
            except RuntimeError:
                return asyncio.run(res)
        return res

    async def verify_account_async(
        self,
        handle_or_url: str,
        account_id: uuid.UUID | None = None,
    ) -> SocialAccountProfile:
        """Asynchronously verifies Instagram account identity and permissions."""
        try:
            username = parse_instagram_profile(handle_or_url)
            acc_id = account_id or uuid.uuid4()
            info = await self.get_account_info(acc_id, username)

            return SocialAccountProfile(
                handle=f"@{info.username}",
                display_name=info.name or info.username,
                profile_image_url=info.profile_picture_url,
                bio=info.biography,
                provider_channel_id=info.provider_account_id,
                follower_or_subscriber_count=info.followers_count,
                is_valid=True,
                metadata={
                    "platform": "INSTAGRAM",
                    "username": info.username,
                    "provider_account_id": info.provider_account_id,
                    "profile_url": instagram_profile_url(info.username),
                    "account_type": info.raw_metadata.get("account_type", "BUSINESS"),
                    "capabilities": {
                        "media_read": True,
                        "reels_read": True,
                    },
                },
            )
        except (ValueError, InstagramMediaNotFoundError):
            return SocialAccountProfile(
                handle=handle_or_url,
                display_name=handle_or_url,
                is_valid=False,
                metadata={"error": "account_not_found"},
            )
        except (InstagramAuthenticationError, InstagramAuthorizationError) as auth_err:
            return SocialAccountProfile(
                handle=handle_or_url,
                display_name=handle_or_url,
                is_valid=False,
                metadata={"error": "unauthorized", "details": str(auth_err)},
            )
        except Exception as exc:
            logger.warning("Instagram verification error for '%s': %s", handle_or_url, exc)
            return SocialAccountProfile(
                handle=handle_or_url,
                display_name=handle_or_url,
                is_valid=False,
                metadata={"error": str(exc)},
            )

    async def fetch_media_page(
        self,
        account: SocialAccount,
        *,
        cursor: str | None = None,
        limit: int = 50,
    ) -> InstagramMediaPage:
        """Fetches a page of InstagramMedia from the Meta Graph API."""
        if self.client is None:
            # Offline test mode mock
            return InstagramMediaPage(items=[], next_cursor=None, has_next=False)

        meta = dict(account.metadata_json or {})
        ig_meta = dict(meta.get("instagram", {}))
        provider_acc_id = (
            account.external_account_id
            or ig_meta.get("provider_account_id")
            or f"1784_{account.handle.lstrip('@')}"
        )

        payload = await self.client.get_media_page(
            account.id,
            provider_acc_id,
            cursor=cursor,
            limit=limit,
        )

        items_data = payload.get("data", [])
        media_list: list[InstagramMedia] = []

        for m in items_data:
            dt: datetime | None = None
            if m.get("timestamp"):
                try:
                    dt = datetime.fromisoformat(m["timestamp"].replace("Z", "+00:00"))
                except Exception:
                    dt = None

            permalink = m.get("permalink") or instagram_permalink(
                m.get("id", "0"),
                is_reel=(m.get("media_product_type") == "REELS"),
            )

            media_list.append(
                InstagramMedia(
                    provider_id=m["id"],
                    media_type=m.get("media_type", "IMAGE"),
                    media_product_type=m.get("media_product_type", "FEED"),
                    caption=m.get("caption"),
                    permalink=permalink,
                    media_url=m.get("media_url"),
                    thumbnail_url=m.get("thumbnail_url"),
                    timestamp=dt,
                    username=m.get("username", account.handle.lstrip("@")),
                    raw_metadata=m,
                )
            )

        paging = payload.get("paging", {})
        cursors = paging.get("cursors", {})
        next_cursor = cursors.get("after")
        has_next = bool(next_cursor and "next" in paging)

        return InstagramMediaPage(
            items=media_list,
            next_cursor=next_cursor,
            has_next=has_next,
        )


__all__ = ["InstagramAdapter"]
