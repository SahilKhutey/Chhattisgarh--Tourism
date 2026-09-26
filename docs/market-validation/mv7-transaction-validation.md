# MV7: Transaction & Conversion Validation Foundation

## 1. Executive Summary

MV7 marks the strategic pivot of **CG Tourism OS** from consumer engagement and discovery validation into **economic-value validation**.

The program progression is:
```
MV1 Market Intelligence
       ↓
MV2 Consumer Problems
       ↓
MV3 Supply Validation
       ↓
MV4 Geographic Validation
       ↓
MV5 Content & Discovery
       ↓
MV6 Consumer MVP
       ↓
MV7 Transaction & Conversion
```

The central question addressed by MV7:
> **Can CG Tourism turn genuine traveler intent into a qualified interaction with tourism supply and ultimately into a completed tourism experience?**

Rather than immediately building complex, premature OTA infrastructure (such as payment gateways, refund engines, wallets, and dispute resolution arbitrations), MV7 validates the assisted commercial workflow:
```
Discovery → Intent → Provider Discovery → Contact / Lead → Qualified Lead → Booking Intent → Booking → Completed Experience → Economic Value
```

---

## 2. Core Validation Objectives

MV7 rigorously validates five hypotheses:
1. **Consumer Intent to Contact**: Travelers with interest in regional experiences proactively initiate contact with local providers.
2. **Supply Responsiveness (SLA)**: Homestays, local guides, and experiential tour operators respond to leads within actionable timeframes (<2 hours target).
3. **Lead Qualification Quality**: Dispatched inquiries represent real travelers with genuine travel intent and budget compatibility, rather than low-quality noise.
4. **Assisted Conversion Viability**: Assisted booking workflows (direct messaging, concierge qualification, explicit host confirmation) convert inquiries into completed experiences without heavy transactional friction.
5. **Economic Value Generation (GTV Facilitated)**: Measurable direct gross tourism value is delivered directly into the local Chhattisgarh economy.

---

## 3. Architecture & Subsystems

The MV7 system comprises six tightly integrated modules in `apps/api/app/modules/market_validation/`:
1. **Leads (`leads/`)**: Extended inquiry lifecycle, duplicate submission detection, automated and researcher qualification.
2. **Booking Intent (`booking_intent/`)**: Expressed traveler intent with dates, party size, payment preferences, and idempotency key safety.
3. **Provider Responsiveness (`provider_response/`)**: SLA measurement across five distinct time buckets (`<5m`, `5-30m`, `30-120m`, `2-24h`, `>24h`) and response actions (`ACCEPT`, `DECLINE`, `QUESTION`, `QUOTE`).
4. **Conversion Funnel (`conversion/`)**: 7-stage macro conversion funnel tracking and drop-off analysis.
5. **Attribution (`attribution/`)**: 30-day attribution window linking transactions back to original discovery touchpoints (content, maps, routes, search).
6. **Transactions & Economic Analysis (`transactions/`, `transaction_analysis/`)**: Facilitated GTV tracking, settlement verification, cancellation root cause analysis, and the Provider Value Score heuristic.

---

## 4. Guardrails & Anti-Patterns Avoided

- **No Premature OTA Gateways**: No merchant aggregators holding funds, escrow compliance burdens, or payment disputes during validation.
- **Zero Commission Friction**: In validation phase, 100% of transaction value flows directly to local hosts and guides.
- **Quality over Volume**: Prioritizing verified high-intent interactions over vanity top-of-funnel clicks.
- **Direct Local Economy Impact**: Validating economic sustainability for rural and tribal host communities across Bastar, Surguja, and Central Chhattisgarh.
