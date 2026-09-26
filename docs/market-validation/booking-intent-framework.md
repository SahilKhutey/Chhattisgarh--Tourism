# Booking Intent Framework & Idempotency Protocol

## 1. Role of Booking Intent in Market Validation

Unlike casual inquiries ("Are you open in November?"), a **Booking Intent** signifies explicit intent to transact:
- Fixed or bounded travel dates (Arrival and Departure).
- Concrete group count (Party size: adults, children).
- Estimated budget or negotiated rate commitment.
- Explicit payment modality chosen.

Validating Booking Intent tests whether travelers are willing to commit their schedule and trip to local providers found on CG Tourism OS.

---

## 2. Intent Lifecycle Transitions

```
[SUBMITTED]
    │
    ├── (Provider rejects / unavailable) ──→ [CANCELLED]
    │
    └── (Provider confirms availability) ──→ [CONFIRMED]
                                                  │
                                                  ├── (Traveler cancels) ──→ [CANCELLED]
                                                  │
                                                  └── (Trip delivered)  ──→ [COMPLETED]
```

### Supported Status Transitions
- `SUBMITTED → CONFIRMED`: Provider accepts dates and pricing.
- `SUBMITTED → CANCELLED`: With reason (`DATES_UNAVAILABLE`, `CAPACITY_EXCEEDED`, `USER_WITHDREW`).
- `CONFIRMED → COMPLETED`: Trip completed and verified.
- `CONFIRMED → CANCELLED`: Pre-trip cancellation with reason.

---

## 3. Idempotency Key Architecture

Network glitches in rural areas or double-taps by users on mobile can result in duplicate intent generation.

To solve this deterministically:
1. Every booking intent submission supports an optional or generated `Idempotency-Key` (header or payload).
2. The server records the key. If an identical key is submitted within 24 hours, the existing booking intent is returned without duplicating records or spamming providers.
3. This guarantees safety across retried mobile requests on intermittent 4G/5G connections across rural Bastar and Surguja.
