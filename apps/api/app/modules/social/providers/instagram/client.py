from __future__ import annotations

import logging
import uuid
from typing import Any
import httpx

from app.modules.social.providers.instagram.credentials import (
    InstagramCredentialService,
)
from app.modules.social.providers.instagram.errors import (
    InstagramAPIError,
    InstagramAuthenticationError,
    InstagramAuthorizationError,
    InstagramMediaNotFoundError,
    InstagramProviderError,
    InstagramRateLimitError,
    InstagramUnavailableError,
    TransientProviderError,
)

logger = logging.getLogger(__name__)


class InstagramClient:
    """Production client for official Meta Graph API / Instagram Graph API."""

    def __init__(
        self,
        *,
        credential_service: InstagramCredentialService,
        base_url: str = "https://graph.facebook.com",
        api_version: str = "v21.0",
        timeout: float = 15.0,
        http_client: httpx.AsyncClient | None = None,
    ) -> None:
        self.credential_service = credential_service
        self.base_url = base_url.rstrip("/")
        self.api_version = api_version.lstrip("/")
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

    async def __aenter__(self) -> InstagramClient:
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.close()

    async def _request(
        self,
        endpoint: str,
        *,
        account_id: uuid.UUID,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        client = await self._get_client()
        url = f"{self.base_url}/{self.api_version}/{endpoint.lstrip('/')}"

        token = await self.credential_service.get_access_token(account_id)

        # STRICT PRIVACY INVARIANT: Never log access token or place it in debug messages
        clean_params = dict(params or {})
        logger.debug(
            "Instagram API request: endpoint=%s params=%s",
            endpoint,
            clean_params,
        )

        query_params = dict(clean_params)
        headers = {"Authorization": f"Bearer {token}"}

        try:
            response = await client.get(url, params=query_params, headers=headers)
        except httpx.TimeoutException as exc:
            logger.warning("Instagram API request timed out: endpoint=%s", endpoint)
            raise TransientProviderError(f"Instagram API request timed out: {exc}") from exc
        except httpx.NetworkError as exc:
            logger.warning("Instagram API network error: endpoint=%s", endpoint)
            raise TransientProviderError(f"Instagram API network error: {exc}") from exc

        status = response.status_code
        if status == 200:
            return response.json()

        # Parse Meta Graph API Error payload
        try:
            error_payload = response.json()
            error_data = error_payload.get("error", {})
            message = error_data.get("message", f"HTTP {status} from Meta Graph API")
            error_code = error_data.get("code")
            error_subcode = error_data.get("error_subcode")
        except Exception:
            message = response.text or f"HTTP {status} from Meta Graph API"
            error_code = None
            error_subcode = None
            error_data = {}

        logger.warning(
            "Instagram API error: endpoint=%s status=%d code=%s subcode=%s message=%s",
            endpoint,
            status,
            error_code,
            error_subcode,
            message,
        )

        # Map error codes
        if status == 401 or error_code in (190,):
            raise InstagramAuthenticationError(
                f"Instagram authentication failed: {message}",
                status_code=status,
                error_code=error_code,
                error_subcode=error_subcode,
                details=error_data,
            )

        if status == 403 or error_code in (10, 200, 298, 299):
            raise InstagramAuthorizationError(
                f"Instagram authorization failed: {message}",
                status_code=status,
                error_code=error_code,
                error_subcode=error_subcode,
                details=error_data,
            )

        if status == 429 or error_code in (4, 17, 32, 613):
            raise InstagramRateLimitError(
                f"Instagram rate limit reached: {message}",
                status_code=status,
                error_code=error_code,
                error_subcode=error_subcode,
                details=error_data,
            )

        if status == 404 or error_code in (100, 803):
            raise InstagramMediaNotFoundError(
                f"Instagram resource not found: {message}",
                status_code=status,
                error_code=error_code,
                error_subcode=error_subcode,
                details=error_data,
            )

        if status >= 500 or error_code in (1, 2):
            raise InstagramUnavailableError(
                f"Meta Graph API service unavailable ({status}): {message}",
                status_code=status,
                error_code=error_code,
                error_subcode=error_subcode,
                details=error_data,
            )

        raise InstagramAPIError(
            f"Instagram API request failed ({status}): {message}",
            status_code=status,
            error_code=error_code,
            error_subcode=error_subcode,
            details=error_data,
        )

    async def get_account_info(
        self,
        account_id: uuid.UUID,
        instagram_business_account_id: str,
    ) -> dict[str, Any]:
        """Fetches profile info for an Instagram business/creator account."""
        fields = (
            "id,username,name,biography,profile_picture_url,followers_count,media_count"
        )
        return await self._request(
            instagram_business_account_id.strip(),
            account_id=account_id,
            params={"fields": fields},
        )

    async def get_media_page(
        self,
        account_id: uuid.UUID,
        instagram_business_account_id: str,
        *,
        cursor: str | None = None,
        limit: int = 50,
    ) -> dict[str, Any]:
        """Fetches page of media for the authorized Instagram account."""
        fields = (
            "id,caption,media_type,media_product_type,media_url,thumbnail_url,"
            "permalink,timestamp,username,children{id,media_type,media_url}"
        )
        params: dict[str, Any] = {
            "fields": fields,
            "limit": min(limit, 50),
        }
        if cursor:
            params["after"] = cursor

        return await self._request(
            f"{instagram_business_account_id.strip()}/media",
            account_id=account_id,
            params=params,
        )

    async def get_media_details(
        self,
        account_id: uuid.UUID,
        media_id: str,
    ) -> dict[str, Any]:
        """Fetches full details for a single Instagram media item."""
        fields = (
            "id,caption,media_type,media_product_type,media_url,thumbnail_url,"
            "permalink,timestamp,username"
        )
        return await self._request(
            media_id.strip(),
            account_id=account_id,
            params={"fields": fields},
        )


__all__ = ["InstagramClient"]
