from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from app.modules.social.domain.enums import SyncStatus
from app.modules.social.models.sync_state import SocialAccountSyncState


@dataclass(slots=True)
class SyncResult:
    account_id: uuid.UUID
    status: str
    discovered: int = 0
    created: int = 0
    updated: int = 0
    skipped: int = 0
    failed: int = 0
    next_cursor: str | None = None
    error: str | None = None
    started_at: datetime | None = None
    finished_at: datetime | None = None


__all__ = ["SyncResult", "SocialAccountSyncState"]
