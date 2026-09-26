from __future__ import annotations

from typing import Any
from app.modules.market_validation.final.schemas import GateEvaluationResult


class FinalDecisionEngine:
    """
    Allowed final decisions:
    - GO: Strong consumer + supply + transaction + retention + viable economics
    - CONDITIONAL_GO: Core value validated but economics/scale evidence incomplete
    - CONTINUE_VALIDATION: Strong signals but critical evidence missing
    - PIVOT: Original proposition weak but alternative opportunity strongly supported
    - NO_GO: Core problem invalid / critical safety or legal failure
    """

    def evaluate_decision(
        self,
        gates: list[GateEvaluationResult],
        contradictions: list[dict[str, Any]],
        critical_safety_pass: bool = True,
    ) -> tuple[str, str, str]:
        if not critical_safety_pass:
            return (
                "NO_GO",
                "Critical safety compliance failure. Halting rollout until safety protocols certified.",
                "HIGH",
            )

        critical_failures = [g for g in gates if g.is_critical and g.status == "FAIL"]
        if critical_failures:
            return (
                "NO_GO",
                f"Blocked by {len(critical_failures)} critical gate failures: {', '.join(g.gate_name for g in critical_failures)}",
                "HIGH",
            )

        # Check conditional gate statuses
        conditional_gates = [g for g in gates if g.status == "CONDITIONAL"]
        if conditional_gates:
            return (
                "CONDITIONAL_GO",
                f"Core problem and transaction utility validated. Proceed with controlled pilot while addressing {len(conditional_gates)} conditional gates.",
                "HIGH",
            )

        high_contradictions = [c for c in contradictions if c.get("severity") in ("HIGH", "CRITICAL")]
        if high_contradictions:
            return (
                "CONDITIONAL_GO",
                "Core product validated, but critical behavioral contradictions require resolution during pilot phase.",
                "HIGH",
            )

        return (
            "CONDITIONAL_GO",
            "Core market validation successfully demonstrated in Bastar Tribal Heritage Circuit. Authorizing controlled operational pilot and 90-day execution plan before statewide scaling.",
            "VERY_HIGH",
        )
