from __future__ import annotations

from sqlalchemy.orm import Session
from app.modules.market_validation.scale_gates.models import ScaleGate
from app.modules.market_validation.scale_gates.schemas import ScaleGateCreate, ScaleGateUpdate


class ScaleGateRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: ScaleGateCreate) -> ScaleGate:
        gate = ScaleGate(
            pilot_id=data.pilot_id,
            gate_name=data.gate_name,
            requirement=data.requirement,
            metric=data.metric,
            threshold=data.threshold,
            actual_value=data.actual_value,
            status=data.status,
            blocker=data.blocker,
            evidence_ids=data.evidence_ids,
        )
        self.db.add(gate)
        self.db.commit()
        self.db.refresh(gate)
        return gate

    def get_by_id(self, gate_id: str) -> ScaleGate | None:
        return self.db.query(ScaleGate).filter(ScaleGate.id == gate_id).first()

    def list_by_pilot(self, pilot_id: str) -> list[ScaleGate]:
        return self.db.query(ScaleGate).filter(ScaleGate.pilot_id == pilot_id).order_by(ScaleGate.gate_name.asc()).all()

    def update(self, gate: ScaleGate, data: ScaleGateUpdate) -> ScaleGate:
        if data.actual_value is not None:
            gate.actual_value = data.actual_value
        if data.status is not None:
            gate.status = data.status
        if data.evidence_ids is not None:
            gate.evidence_ids = data.evidence_ids
        self.db.commit()
        self.db.refresh(gate)
        return gate
