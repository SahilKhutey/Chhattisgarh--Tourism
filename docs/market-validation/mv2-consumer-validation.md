# MV2 — Consumer Problem Validation Foundation

## 1. Objective & Philosophy
MV2 transitions research from market landscaping (MV1) to behavioral inquiry:
> "What problems do real travelers actually experience, how do they solve them today, and which problems are painful enough to justify CG Tourism OS?"

### The Cardinal Rule
**Never ask users: "Would you use CG Tourism?"**
Instead, observe behavioral evidence:
> "You have three days in Bastar starting from Raipur. Show me exactly how you plan it."

```
Real Traveler → Travel Situation → Job To Be Done → Current Behavior → Current Tools → Pain / Friction → Workaround → Desired Outcome → CG Tourism Opportunity
```

## 2. Six Core Systems
1. **Research Participant System** — Consent-verified, anonymous participant registry with behavioral tagging.
2. **Interview System** — Protocol-driven execution with status lifecycles (`PLANNED` -> `CONDUCTED` -> `TRANSCRIBED` -> `ANALYZED`).
3. **Problem & Pain System** — Quantitative pain calculation across 5 dimensions ($F \times S \times T \times Tr$).
4. **JTBD Validation System** — Grounding 6 core jobs with empirical evidence breadth and confidence.
5. **Evidence System** — Strict hierarchy of evidence prioritizing direct observation over reported desire.
6. **Validation Analysis System** — Real-time analytics, workflow fragmentation measurement, and researcher dashboards.

## 3. Workflow Fragmentation Index
$$\text{Workflow Fragmentation} = \text{Count of Distinct Tools Used to Complete One Planning Task}$$
- Typical observed workflow: Google Search (1) + YouTube (2) + Google Maps (3) + Booking OTA (4) + Instagram (5) + WhatsApp (6) + Notes App (7) = **7 tools**.
- High fragmentation represents a clear integration and trust opportunity for CG Tourism OS.

## 4. API Endpoints
Base: `/api/v1/market-validation`
- `/participants` (CRUD, segment filters)
- `/interviews` (Lifecycle, transcripts, key findings)
- `/problems` (Severity, pain scores, journey stages)
- `/evidence` (Observations linked to problems & JTBD)
- `/jobs` (JTBD status, evidence summaries)
- `/validation` (Support, invalidate status transitions)
- `/analysis/summary`, `/analysis/problems`, `/analysis/workflow-fragmentation`
