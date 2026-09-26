from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.market_validation.auth import require_pilot_operator, require_pilot_approver, AuthUser
from app.modules.market_validation.pilot.dependencies import get_expected_version
from app.modules.market_validation.pilot.schemas import (
    PilotCreate,
    PilotUpdate,
    PilotResponse,
    PilotCohortCreate,
    PilotCohortResponse,
    PilotAuditEventResponse,
)
from app.modules.market_validation.pilot.service import PilotService

router = APIRouter(prefix="/pilots", tags=["market-validation-pilot"])


@router.post("", response_model=PilotResponse, status_code=status.HTTP_201_CREATED)
def create_pilot(
    data: PilotCreate,
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_pilot_operator),
):
    service = PilotService(db)
    return service.create_pilot(
        data,
        actor_id=str(user.id),
        actor_role=user.role,
        initial_status="DRAFT",
    )


@router.get("", response_model=list[PilotResponse])
def list_pilots(
    status: str | None = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    service = PilotService(db)
    return service.list_pilots(status=status, limit=limit, offset=offset)


@router.get("/{pilot_id}", response_model=PilotResponse)
def get_pilot(pilot_id: str, db: Session = Depends(get_db)):
    service = PilotService(db)
    return service.get_pilot(pilot_id)


@router.put("/{pilot_id}", response_model=PilotResponse)
def update_pilot(
    pilot_id: str,
    data: PilotUpdate,
    expected_version: int | None = Depends(get_expected_version),
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_pilot_operator),
):
    service = PilotService(db)
    return service.update_pilot(
        pilot_id=pilot_id,
        data=data,
        actor_id=str(user.id),
        actor_role=user.role,
        expected_version=expected_version,
    )


@router.post("/{pilot_id}/transition/{target_status}", response_model=PilotResponse)
def transition_pilot(
    pilot_id: str,
    target_status: str,
    expected_version: int | None = Depends(get_expected_version),
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_pilot_operator),
):
    # Transitioning to APPROVED or PROMOTED requires higher privilege
    if target_status.upper() in ("APPROVED", "PROMOTED"):
        require_pilot_approver(user)

    service = PilotService(db)
    return service.transition_status(
        pilot_id=pilot_id,
        target_status=target_status.upper(),
        actor_id=str(user.id),
        actor_role=user.role,
        expected_version=expected_version,
    )


@router.post("/{pilot_id}/pause", response_model=PilotResponse)
def pause_pilot(
    pilot_id: str,
    expected_version: int | None = Depends(get_expected_version),
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_pilot_operator),
):
    service = PilotService(db)
    return service.pause_pilot(
        pilot_id=pilot_id,
        actor_id=str(user.id),
        actor_role=user.role,
        expected_version=expected_version,
    )


@router.post("/{pilot_id}/resume", response_model=PilotResponse)
def resume_pilot(
    pilot_id: str,
    expected_version: int | None = Depends(get_expected_version),
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_pilot_operator),
):
    service = PilotService(db)
    return service.resume_pilot(
        pilot_id=pilot_id,
        actor_id=str(user.id),
        actor_role=user.role,
        expected_version=expected_version,
    )


@router.post("/{pilot_id}/complete", response_model=PilotResponse)
def complete_pilot(
    pilot_id: str,
    expected_version: int | None = Depends(get_expected_version),
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_pilot_operator),
):
    service = PilotService(db)
    return service.complete_pilot(
        pilot_id=pilot_id,
        actor_id=str(user.id),
        actor_role=user.role,
        expected_version=expected_version,
    )


@router.post("/{pilot_id}/cohorts", response_model=PilotCohortResponse, status_code=status.HTTP_201_CREATED)
def record_cohort(
    pilot_id: str,
    data: PilotCohortCreate,
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_pilot_operator),
):
    service = PilotService(db)
    data.pilot_id = pilot_id
    return service.record_cohort(data)


@router.get("/{pilot_id}/cohorts", response_model=list[PilotCohortResponse])
def list_cohorts(pilot_id: str, db: Session = Depends(get_db)):
    service = PilotService(db)
    return service.list_cohorts(pilot_id)


@router.get("/{pilot_id}/audit-trail", response_model=list[PilotAuditEventResponse])
def get_audit_trail(pilot_id: str, db: Session = Depends(get_db)):
    from app.modules.market_validation.pilot.models import PilotAuditEvent
    return (
        db.query(PilotAuditEvent)
        .filter(PilotAuditEvent.pilot_id == pilot_id)
        .order_by(PilotAuditEvent.timestamp.asc())
        .all()
    )
