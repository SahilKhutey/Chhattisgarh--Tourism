from __future__ import annotations

from typing import Any


class FinalRiskEngine:
    def detect_contradictions(self, evidence: dict[str, Any]) -> list[dict[str, Any]]:
        """Surfaces divergence between stated intention and actual behavior."""
        contradictions = [
            {
                "id": "CONTRA-01",
                "domain": "TRANSACTION_VS_PAYMENT",
                "severity": "MEDIUM",
                "observation": "74% hosts stated willingness to pay, but upfront subscription adoption was slower than pay-per-lead.",
                "mitigation": "Lead with pay-per-qualified-lead model before introducing Pro subscriptions.",
            },
            {
                "id": "CONTRA-02",
                "domain": "TRAFFIC_VS_INTENT",
                "severity": "LOW",
                "observation": "High organic search for waterfalls, but longer booking cycles for cultural immersion.",
                "mitigation": "Bundle cultural craft trails as natural extensions of waterfall visits.",
            },
        ]
        return contradictions

    def get_unknowns(self) -> list[dict[str, Any]]:
        return [
            {
                "id": "UNK-01",
                "question": "Will tribal homestays sustain responsiveness during off-season monsoon lulls?",
                "impact": "Host SLA degradation during Q3",
                "experiment_required": "Off-season monsoon package pilot in Kanger Valley",
                "owner": "SUPPLY_LEAD",
                "deadline": "Day 45",
            },
            {
                "id": "UNK-02",
                "question": "Can Bastar guide community maintain English/Hindi fluency as interstate traveler volume doubles?",
                "impact": "Traveler review rating decline",
                "experiment_required": "Regional language certification partnership with district tourism office",
                "owner": "OPERATIONS_LEAD",
                "deadline": "Day 60",
            },
        ]
