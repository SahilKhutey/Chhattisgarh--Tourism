from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.market_validation.auth import require_pilot_operator, AuthUser
from app.modules.market_validation.launch_controls.schemas import LaunchControlUpdate, LaunchControlResponse
from app.modules.market_validation.launch_controls.service import LaunchControlService

router = APIRouter(prefix="/launch-controls", tags=["market-validation-launch-controls"])


@router.get("/{pilot_id}", response_model=list[LaunchControlResponse])
def list_launch_controls(pilot_id: str, db: Session = Depends(get_db)):
    service = LaunchControlService(db)
    return service.list_controls(pilot_id)


@router.put("/control/{control_id}", response_model=LaunchControlResponse)
def update_launch_control(
    control_id: str,
    data: LaunchControlUpdate,
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_pilot_operator),
):
    service = LaunchControlService(db)
    return service.update_control(control_id, data)
