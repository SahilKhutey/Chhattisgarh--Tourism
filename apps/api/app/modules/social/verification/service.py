from __future__ import annotations

import inspect
import uuid
from typing import Any

from app.core.errors import AppError
from app.events.publisher import create_outbox_event
from app.events.types import EventType
from app.modules.social.domain.enums import SocialAccountStatus, SocialPlatform
from app.modules.social.verification.results import (
    CreatorVerificationLevel,
    VerificationResult,
    VerificationStatus,
)


class SocialVerificationService:
    """Verifies that an external social account legitimately exists on the provider platform."""

    def __init__(
        self,
        provider_registry: Any,
        account_repository: Any,
        audit_service: Any = None,
        event_service: Any = None,
    ) -> None:
        self.provider_registry = provider_registry
        self.account_repository = account_repository
        self.audit_service = audit_service
        self.event_service = event_service

    def _call_provider(self, provider: Any, identifier: str) -> Any:
        func = getattr(provider, "verify_account")
        res = func(identifier)
        if inspect.isawaitable(res):
            import asyncio
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    # If inside a running loop, run in a separate runner or thread if needed
                    import concurrent.futures
                    with concurrent.futures.ThreadPoolExecutor() as pool:
                        return pool.submit(asyncio.run, res).result()
                else:
                    return loop.run_until_complete(res)
            except RuntimeError:
                return asyncio.run(res)
        return res

    def verify_account_sync(self, account: Any) -> VerificationResult:
        platform_enum = SocialPlatform(account.platform) if isinstance(account.platform, str) else account.platform
        provider = self.provider_registry.get(platform_enum)

        identifier = account.profile_url or account.handle

        try:
            profile = self._call_provider(provider, identifier)

            is_valid = getattr(profile, "is_valid", True)
            ext_id = getattr(profile, "external_id", None) or getattr(profile, "provider_channel_id", None) or getattr(profile, "external_account_id", None)

            if is_valid and ext_id:
                # Update repository
                set_func = getattr(self.account_repository, "set_verified", None)
                if set_func:
                    res = set_func(
                        account.id,
                        external_account_id=ext_id,
                        handle=getattr(profile, "handle", account.handle),
                    )
                    if inspect.isawaitable(res):
                        import asyncio
                        asyncio.run(res)

                # Record audit & outbox event
                if self.audit_service:
                    self.audit_service.record(
                        action="SOCIAL_ACCOUNT_VERIFIED",
                        entity_type="social_account",
                        entity_id=account.id,
                        details={"external_account_id": ext_id},
                    )

                session = getattr(self.account_repository, "session", None) or getattr(self.account_repository, "db", None)
                if session:
                    create_outbox_event(
                        session,
                        event_type="SOCIAL_ACCOUNT_VERIFIED",
                        aggregate_id=account.id,
                        payload={
                            "account_id": str(account.id),
                            "creator_id": str(account.creator_id),
                            "platform": str(account.platform),
                            "external_account_id": ext_id,
                        },
                    )

                return VerificationResult(
                    verified=True,
                    external_account_id=ext_id,
                    handle=getattr(profile, "handle", account.handle),
                    display_name=getattr(profile, "display_name", None),
                    profile_url=getattr(profile, "profile_url", account.profile_url),
                    status=VerificationStatus.VERIFIED,
                )
            else:
                return VerificationResult(
                    verified=False,
                    external_account_id=None,
                    handle=getattr(profile, "handle", account.handle),
                    display_name=getattr(profile, "display_name", None),
                    profile_url=getattr(profile, "profile_url", account.profile_url),
                    reason="Handle could not be verified on external platform.",
                    status=VerificationStatus.NOT_FOUND,
                )

        except Exception as exc:
            return VerificationResult(
                verified=False,
                external_account_id=None,
                handle=account.handle,
                display_name=None,
                profile_url=account.profile_url,
                reason=f"Provider error: {str(exc)}",
                status=VerificationStatus.PROVIDER_ERROR,
            )

    async def verify_account(self, account: Any) -> VerificationResult:
        platform_enum = SocialPlatform(account.platform) if isinstance(account.platform, str) else account.platform
        provider = self.provider_registry.get(platform_enum)

        identifier = account.profile_url or account.handle

        try:
            func = getattr(provider, "verify_account")
            res = func(identifier)
            profile = await res if inspect.isawaitable(res) else res

            is_valid = getattr(profile, "is_valid", True)
            ext_id = getattr(profile, "external_id", None) or getattr(profile, "provider_channel_id", None) or getattr(profile, "external_account_id", None)

            if is_valid and ext_id:
                set_func = getattr(self.account_repository, "set_verified", None)
                if set_func:
                    res_set = set_func(
                        account.id,
                        external_account_id=ext_id,
                        handle=getattr(profile, "handle", account.handle),
                    )
                    if inspect.isawaitable(res_set):
                        await res_set

                if self.audit_service:
                    record_func = getattr(self.audit_service, "record")
                    res_rec = record_func(
                        action="SOCIAL_ACCOUNT_VERIFIED",
                        entity_type="social_account",
                        entity_id=account.id,
                        details={"external_account_id": ext_id},
                    )
                    if inspect.isawaitable(res_rec):
                        await res_rec

                return VerificationResult(
                    verified=True,
                    external_account_id=ext_id,
                    handle=getattr(profile, "handle", account.handle),
                    display_name=getattr(profile, "display_name", None),
                    profile_url=getattr(profile, "profile_url", account.profile_url),
                    status=VerificationStatus.VERIFIED,
                )
            else:
                return VerificationResult(
                    verified=False,
                    external_account_id=None,
                    handle=getattr(profile, "handle", account.handle),
                    display_name=getattr(profile, "display_name", None),
                    profile_url=getattr(profile, "profile_url", account.profile_url),
                    reason="Handle could not be verified on external platform.",
                    status=VerificationStatus.NOT_FOUND,
                )
        except Exception as exc:
            return VerificationResult(
                verified=False,
                external_account_id=None,
                handle=account.handle,
                display_name=None,
                profile_url=account.profile_url,
                reason=f"Provider error: {str(exc)}",
                status=VerificationStatus.PROVIDER_ERROR,
            )


class CreatorVerificationService:
    """Manages editorial trust levels for creators within CG Tourism OS."""

    def __init__(
        self,
        creator_repository: Any,
        audit_service: Any = None,
        event_service: Any = None,
    ) -> None:
        self.creator_repository = creator_repository
        self.audit_service = audit_service
        self.event_service = event_service

    def verify_level(
        self,
        creator_id: uuid.UUID,
        level: CreatorVerificationLevel,
        actor_id: Any = None,
        notes: str | None = None,
    ) -> Any:
        creator = self.creator_repository.get_by_id(creator_id)
        if not creator:
            raise AppError(code="CREATOR_NOT_FOUND", message=f"Creator '{creator_id}' not found.", status_code=404)

        creator.is_verified = level != CreatorVerificationLevel.UNVERIFIED
        meta = dict(getattr(creator, "metadata_json", {}) or {})
        meta["verification_level"] = level.value
        meta["verification_notes"] = notes
        creator.metadata_json = meta

        if self.audit_service:
            self.audit_service.record(
                action="CREATOR_VERIFIED",
                entity_type="creator",
                entity_id=creator.id,
                actor_id=actor_id,
                details={"level": level.value, "notes": notes},
            )
        return creator


__all__ = [
    "SocialVerificationService",
    "CreatorVerificationService",
]
