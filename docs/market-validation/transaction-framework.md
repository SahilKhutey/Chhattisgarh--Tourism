# Transaction Validation Framework

## 1. Concept: The Assisted Transaction Model

For emerging tourism destinations like Chhattisgarh, a traditional instant-book checkout model frequently fails because:
1. Rural homestay operators may have intermittent internet connectivity.
2. Inventory is dynamic (limited rooms, seasonal guiding, tribal cultural calendar constraints).
3. Travelers need personalized clarification regarding road access, language, local customs, and food options.

Therefore, CG Tourism OS validates an **Assisted Transaction Model**:
```
Consumer Intent 
      ↓
Assisted Lead Submission (Lead & Booking Intent)
      ↓
System Qualification Check (Spam, Duplicate, Budget feasibility)
      ↓
Provider Dispatch (SMS / WhatsApp / Dashboard notification)
      ↓
Provider Response (Accept, Quote, Clarify)
      ↓
Direct Host-Guest Confirmation
      ↓
Experience Delivery & Post-Trip Verification
```

---

## 2. Transaction Lifecycle States

Transactions progress through explicit, audit-tracked states:

| State | Definition | Trigger / Action |
|-------|------------|------------------|
| `INITIATED` | Booking intent verified and accepted by provider. | Created upon confirmed booking intent. |
| `IN_PROGRESS` | Booking dates active; guest arrival pending or ongoing. | Scheduled experience start date reached. |
| `COMPLETED` | Experience successfully delivered; verified by consumer or operator. | Post-trip check or host confirmation. |
| `CANCELLED` | Booking cancelled before delivery with mandatory reason code. | Consumer or provider cancellation. |
| `DISPUTED` | Conflict regarding delivery, quality, or settlement. | Escalated to validation operator. |

---

## 3. Settlement Models Tested

During validation, four settlement modalities are tested to understand host and traveler preferences:
1. `PAY_ON_ARRIVAL`: Direct cash or local UPI payment upon check-in (lowest friction for rural homestays).
2. `DIRECT_TO_PROVIDER`: Direct UPI transfer to host ahead of arrival (requires trust threshold).
3. `ASSISTED_CONCIERGE`: Facilitated offline coordination for multi-day tribal circuit itineraries.
4. `VOUCHER_REDEMPTION`: Digital voucher presented to local attraction/guide.

---

## 4. Economic Verification Protocol

To verify that reported transactions represent genuine economic exchange rather than test noise:
- Dual-party confirmation: Post-experience feedback recorded from both provider and traveler.
- Time-to-completion verification: Transactions cannot be marked completed prior to actual travel dates.
- Value reasonableness bounds: Transaction amounts audited against regional standard benchmark rates (homestays ₹1,200 - ₹5,000/night; guided day treks ₹1,500 - ₹3,500).
