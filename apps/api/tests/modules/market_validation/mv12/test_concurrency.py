import pytest
from fastapi import HTTPException


class EntityWithLocking:
    def __init__(self, version: int = 1):
        self.version = version

    def update(self, expected_version: int):
        if self.version != expected_version:
            raise HTTPException(
                status_code=409,
                detail=f"Conflict: entity at version {self.version} != expected {expected_version}",
            )
        self.version += 1


def test_concurrent_update_optimistic_lock_conflict():
    entity = EntityWithLocking(version=5)

    # Admin A successfully updates version 5 -> 6
    entity.update(expected_version=5)
    assert entity.version == 6

    # Admin B submits with stale version 5 -> raises 409 Conflict
    with pytest.raises(HTTPException) as exc:
        entity.update(expected_version=5)
    assert exc.value.status_code == 409
    assert "Conflict" in exc.value.detail
