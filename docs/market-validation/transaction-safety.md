# Transaction Safety, Trust, & Fraud Prevention

## 1. Safety Principles During Assisted Validation

Because CG Tourism OS does not act as a custodial payment intermediary during validation, safety and trust mechanisms operate at the communication and verification layer:

1. **Provider Verification Mandate**: Only providers who have completed physical or digital verification (via MV3 onboarding and field researcher interviews) are eligible to receive direct booking intents.
2. **Transparent Contact Directness**: Travelers interact directly with known local hosts; no pseudonymous middle-agents.
3. **Emergency Support Escalation**: Prominent safety contacts and district tourism police coordination details available for all remote expeditions.

---

## 2. Fraud & Spam Prevention

- **Deduplication Safeguards**: Submitting identical inquiries within 15 minutes is automatically intercepted to protect provider phones from automated spamming.
- **Idempotency Keys**: Cryptographic or unique client keys prevent accidental double-commitments.
- **Fair Play Auditing**: Researchers audit outlier cancellation spikes to ensure providers are not dishonoring verbal confirmations.

---

## 3. Dispute Resolution Protocol

In the event of pricing mismatches, no-shows, or weather disruptions:
1. Direct amicable host-traveler resolution is facilitated via phone/chat.
2. If unresolved, platform market researchers document the case under `market_transaction_feedback` with reason code `DISPUTED`.
3. Patterns of recurring disputes result in provider suspension from assisted listing status.
