from __future__ import annotations

import logging
import uuid
import httpx
import pytest

from app.modules.social.providers.instagram.client import InstagramClient
from app.modules.social.providers.instagram.credentials import (
    InMemoryInstagramCredentialService,
)
from app.modules.social.providers.instagram.errors import (
    InstagramAPIError,
    InstagramAuthenticationError,
    InstagramAuthorizationError,
    InstagramMediaNotFoundError,
    InstagramRateLimitError,
    InstagramUnavailableError,
    TransientProviderError,
)


@pytest.fixture
def account_id() -> uuid.UUID:
    return uuid.uuid4()


@pytest.fixture
def credentials(account_id: uuid.UUID) -> InMemoryInstagramCredentialService:
    service = InMemoryInstagramCredentialService()
    service.set_token(account_id, "test_meta_access_token_xyz123")
    return service


@pytest.mark.asyncio
async def test_get_account_info_success(account_id: uuid.UUID, credentials: InMemoryInstagramCredentialService):
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/v21.0/1784140001"
        assert "access_token" not in request.url.params
        assert request.headers["authorization"] == "Bearer test_meta_access_token_xyz123"
        return httpx.Response(
            200,
            json={
                "id": "1784140001",
                "username": "cg_tourism_official",
                "name": "Chhattisgarh Tourism",
                "biography": "Official tourism account of Chhattisgarh.",
                "profile_picture_url": "https://example.com/avatar.jpg",
                "followers_count": 45000,
                "media_count": 120,
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)

    info = await client.get_account_info(account_id, "1784140001")
    assert info["id"] == "1784140001"
    assert info["username"] == "cg_tourism_official"
    assert info["followers_count"] == 45000


@pytest.mark.asyncio
async def test_get_media_page_success(account_id: uuid.UUID, credentials: InMemoryInstagramCredentialService):
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/v21.0/1784140001/media"
        assert request.url.params["limit"] == "25"
        assert request.url.params["after"] == "cursor_token_abc"
        assert "access_token" not in request.url.params
        assert request.headers["authorization"] == "Bearer test_meta_access_token_xyz123"
        return httpx.Response(
            200,
            json={
                "data": [
                    {
                        "id": "1790000001",
                        "caption": "Chitrakote Falls during monsoon #bastar",
                        "media_type": "VIDEO",
                        "media_product_type": "REELS",
                        "permalink": "https://www.instagram.com/reel/Cx12345/",
                        "timestamp": "2026-10-05T12:00:00+0000",
                    }
                ],
                "paging": {
                    "cursors": {"after": "cursor_next_xyz"},
                    "next": "https://graph.facebook.com/v21.0/1784140001/media?after=cursor_next_xyz",
                },
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)

    res = await client.get_media_page(
        account_id,
        "1784140001",
        cursor="cursor_token_abc",
        limit=25,
    )
    assert len(res["data"]) == 1
    assert res["data"][0]["id"] == "1790000001"
    assert res["paging"]["cursors"]["after"] == "cursor_next_xyz"


@pytest.mark.asyncio
async def test_get_media_details_success(account_id: uuid.UUID, credentials: InMemoryInstagramCredentialService):
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/v21.0/1790000001"
        return httpx.Response(
            200,
            json={
                "id": "1790000001",
                "caption": "Bastar Dhokra Art #tribalart",
                "media_type": "IMAGE",
                "permalink": "https://www.instagram.com/p/Cx67890/",
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)

    details = await client.get_media_details(account_id, "1790000001")
    assert details["id"] == "1790000001"
    assert details["media_type"] == "IMAGE"


@pytest.mark.asyncio
async def test_error_mapping_401_and_code_190(account_id: uuid.UUID, credentials: InMemoryInstagramCredentialService):
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            400,
            json={
                "error": {
                    "message": "Error validating access token: Session has expired.",
                    "type": "OAuthException",
                    "code": 190,
                    "error_subcode": 463,
                }
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)

    with pytest.raises(InstagramAuthenticationError) as exc_info:
        await client.get_account_info(account_id, "1784140001")
    assert exc_info.value.error_code == 190
    assert exc_info.value.error_subcode == 463


@pytest.mark.asyncio
async def test_error_mapping_403_and_code_200(account_id: uuid.UUID, credentials: InMemoryInstagramCredentialService):
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            403,
            json={
                "error": {
                    "message": "(#200) Requires instagram_basic or pages_show_list permission",
                    "type": "OAuthException",
                    "code": 200,
                }
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)

    with pytest.raises(InstagramAuthorizationError) as exc_info:
        await client.get_account_info(account_id, "1784140001")
    assert exc_info.value.error_code == 200


@pytest.mark.asyncio
async def test_error_mapping_429_rate_limit(account_id: uuid.UUID, credentials: InMemoryInstagramCredentialService):
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            429,
            json={
                "error": {
                    "message": "(#4) Application request limit reached",
                    "type": "OAuthException",
                    "code": 4,
                }
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)

    with pytest.raises(InstagramRateLimitError) as exc_info:
        await client.get_account_info(account_id, "1784140001")
    assert exc_info.value.error_code == 4


@pytest.mark.asyncio
async def test_error_mapping_404_media_not_found(account_id: uuid.UUID, credentials: InMemoryInstagramCredentialService):
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            404,
            json={
                "error": {
                    "message": "Unsupported get request. Object with ID does not exist.",
                    "type": "GraphMethodException",
                    "code": 100,
                }
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)

    with pytest.raises(InstagramMediaNotFoundError) as exc_info:
        await client.get_media_details(account_id, "nonexistent_media_id")
    assert exc_info.value.error_code == 100


@pytest.mark.asyncio
async def test_error_mapping_500_service_unavailable(account_id: uuid.UUID, credentials: InMemoryInstagramCredentialService):
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            500,
            json={
                "error": {
                    "message": "An unknown error has occurred.",
                    "type": "OAuthException",
                    "code": 1,
                }
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)

    with pytest.raises(InstagramUnavailableError) as exc_info:
        await client.get_account_info(account_id, "1784140001")
    assert exc_info.value.status_code == 500


@pytest.mark.asyncio
async def test_transient_network_and_timeout_errors(account_id: uuid.UUID, credentials: InMemoryInstagramCredentialService):
    def timeout_handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ReadTimeout("Read timed out")

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(timeout_handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)

    with pytest.raises(TransientProviderError, match="timed out"):
        await client.get_account_info(account_id, "1784140001")


@pytest.mark.asyncio
async def test_client_context_manager(account_id: uuid.UUID, credentials: InMemoryInstagramCredentialService):
    client = InstagramClient(credential_service=credentials)
    async with client as c:
        assert c is not None
