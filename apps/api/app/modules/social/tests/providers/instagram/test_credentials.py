from __future__ import annotations

import uuid
import pytest

from app.modules.social.providers.instagram.credentials import (
    InMemoryInstagramCredentialService,
    mask_token,
)
from app.modules.social.providers.instagram.errors import InstagramAuthenticationError


def test_mask_token():
    assert mask_token(None) == "[EMPTY]"
    assert mask_token("") == "[EMPTY]"
    assert mask_token("short") == "[MASKED]"
    assert mask_token("12345678") == "[MASKED]"
    assert mask_token("EAAB_test_token_1234") == "EAAB...1234"


@pytest.mark.asyncio
async def test_in_memory_credential_service():
    account_id = uuid.uuid4()
    service = InMemoryInstagramCredentialService()

    # Missing token raises authentication error
    with pytest.raises(InstagramAuthenticationError, match="No Instagram access token available"):
        await service.get_access_token(account_id)

    # Set token
    service.set_token(account_id, "token_12345")
    assert await service.get_access_token(account_id) == "token_12345"
    assert await service.refresh_if_required(account_id) == "token_12345"

    # Revoke token
    await service.revoke(account_id)
    with pytest.raises(InstagramAuthenticationError, match="No Instagram access token available"):
        await service.get_access_token(account_id)
