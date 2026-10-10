from __future__ import annotations

import logging
from typing import Any
import httpx

from app.modules.social.providers.youtube.errors import (
    TransientProviderError,
    YouTubeAccountNotFoundError,
    YouTubeAPIError,
    YouTubeAuthenticationError,
    YouTubeQuotaExceededError,
    YouTubeRateLimitError,
    YouTubeUnavailableError,
)
from app.modules.social.providers.youtube.parser import clean_handle

logger = logging.getLogger(__name__)


class YouTubeClient:
    """Production asynchronous client for YouTube Data API v3."""

    def __init__(
        self,
        *,
        api_key: str,
        base_url: str = "https://www.googleapis.com/youtube/v3",
        timeout: float = 15.0,
        http_client: httpx.AsyncClient | None = None,
    ) -> None:
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._external_client = http_client
        self._owned_client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._external_client is not None:
            return self._external_client
        if self._owned_client is None or self._owned_client.is_closed:
            self._owned_client = httpx.AsyncClient(timeout=self.timeout)
        return self._owned_client

    async def close(self) -> None:
        if self._owned_client is not None and not self._owned_client.is_closed:
            await self._owned_client.aclose()
            self._owned_client = None

    async def __aenter__(self) -> YouTubeClient:
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.close()

    async def _request(
        self,
        endpoint: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        client = await self._get_client()
        url = f"{self.base_url}/{endpoint.lstrip('/')}"

        query_params = dict(params or {})
        query_params["key"] = self.api_key

        # Sanitized logging: never print API key in logs
        log_params = {k: v for k, v in query_params.items() if k != "key"}
        logger.debug("YouTube API request: endpoint=%s params=%s", endpoint, log_params)

        try:
            response = await client.get(url, params=query_params)
        except httpx.TimeoutException as exc:
            logger.warning("YouTube API request timed out: endpoint=%s", endpoint)
            raise TransientProviderError(f"YouTube API request timed out: {exc}") from exc
        except httpx.NetworkError as exc:
            logger.warning("YouTube API network error: endpoint=%s error=%s", endpoint, exc)
            raise TransientProviderError(f"YouTube API network error: {exc}") from exc

        status = response.status_code
        if status == 200:
            return response.json()

        # Handle API Error responses
        try:
            error_payload = response.json()
            error_data = error_payload.get("error", {})
            message = error_data.get("message", f"HTTP {status} from YouTube API")
            errors_list = error_data.get("errors", [])
            reason = errors_list[0].get("reason") if errors_list else None
        except Exception:
            message = response.text or f"HTTP {status} from YouTube API"
            reason = None
            error_data = {}

        logger.warning(
            "YouTube API error: endpoint=%s status=%d reason=%s message=%s",
            endpoint,
            status,
            reason,
            message,
        )

        if status == 429:
            raise YouTubeRateLimitError(
                f"YouTube rate limit exceeded: {message}",
                status_code=429,
                reason="rateLimitExceeded",
                details=error_data,
            )

        if status == 403:
            if reason in ("quotaExceeded", "dailyLimitExceeded"):
                raise YouTubeQuotaExceededError(
                    f"YouTube API quota exceeded: {message}",
                    status_code=403,
                    reason=reason,
                    details=error_data,
                )
            if reason in ("keyInvalid", "forbidden", "accessNotConfigured"):
                raise YouTubeAuthenticationError(
                    f"YouTube authentication failure: {message}",
                    status_code=403,
                    reason=reason,
                    details=error_data,
                )
            raise YouTubeAPIError(
                f"YouTube forbidden error: {message}",
                status_code=403,
                reason=reason,
                details=error_data,
            )

        if status == 401:
            raise YouTubeAuthenticationError(
                f"Invalid YouTube credentials: {message}",
                status_code=401,
                reason="unauthorized",
                details=error_data,
            )

        if status == 404:
            raise YouTubeAccountNotFoundError(
                f"YouTube resource not found: {message}",
                status_code=404,
                reason="notFound",
                details=error_data,
            )

        if status >= 500:
            raise YouTubeUnavailableError(
                f"YouTube service unavailable ({status}): {message}",
                status_code=status,
                reason="backendError",
                details=error_data,
            )

        raise YouTubeAPIError(
            f"YouTube API call failed ({status}): {message}",
            status_code=status,
            reason=reason,
            details=error_data,
        )

    async def get_channel_by_handle(self, handle: str) -> dict[str, Any]:
        """Resolves channel details using channels.list forHandle."""
        cleaned = clean_handle(handle)
        return await self._request(
            "channels",
            params={
                "part": "snippet,contentDetails,statistics",
                "forHandle": cleaned,
            },
        )

    async def get_channel_by_id(self, channel_id: str) -> dict[str, Any]:
        """Resolves channel details using channels.list id."""
        return await self._request(
            "channels",
            params={
                "part": "snippet,contentDetails,statistics",
                "id": channel_id.strip(),
            },
        )

    async def get_playlist_items(
        self,
        playlist_id: str,
        *,
        page_token: str | None = None,
        max_results: int = 50,
    ) -> dict[str, Any]:
        """Fetches page of playlist items (e.g. uploads playlist) via playlistItems.list."""
        params: dict[str, Any] = {
            "part": "snippet,contentDetails",
            "playlistId": playlist_id.strip(),
            "maxResults": min(max_results, 50),
        }
        if page_token:
            params["pageToken"] = page_token
        return await self._request("playlistItems", params=params)

    async def get_videos(self, video_ids: list[str]) -> dict[str, Any]:
        """Fetches batch of video items using videos.list for up to 50 video IDs."""
        if not video_ids:
            return {"items": []}

        # Cap at 50 per batch as per YouTube API v3 limit
        batch = [v.strip() for v in video_ids[:50] if v.strip()]
        return await self._request(
            "videos",
            params={
                "part": "snippet,contentDetails,status,statistics",
                "id": ",".join(batch),
            },
        )


__all__ = ["YouTubeClient"]
