# Tourism Lead Lifecycle & Qualification Framework

## 1. Overview

A "lead" in CG Tourism OS represents explicit interest expressed by an identified or verified consumer in a specific tourism provider, destination, or experiential offering.

Unqualified leads flood providers with spam and reduce provider engagement. Overly strict qualification creates friction and drops genuine demand. This framework defines the balance.

---

## 2. Lead Data Schema & Sources

### Canonical Sources
- `SEARCH`: Search result interaction.
- `DESTINATION`: Direct destination overview page inquiry.
- `MAP`: Geographic map pin contact action.
- `NEARBY`: Nearby place or attraction card.
- `EXPERIENCE`: Experiential activity page (e.g., Kanger Valley caving, Bastar Bell Metal workshop).
- `CREATOR`: Curated creator trail / story endorsement.
- `ROUTE`: Multi-stop curated scenic itinerary.
- `RECOMMENDATION`: Algorithmic personalized suggestion.
- `TRIP`: Multi-day itinerary planner export.
- `DIRECT`: Direct provider profile visit.

---

## 3. Duplicate Prevention & Spam Control

To prevent provider fatigue and denial-of-service spam:
- **Deduplication Window**: Inquiries from the same consumer/session to the same provider for the same destination within **15 minutes** are flagged as duplicates (`DUPLICATE_LEAD`).
- **Rate Limiting**: Limits per anonymous session ensure bots cannot spam local operators.

---

## 4. Qualification Logic & Taxonomy

Leads are categorized into four states:
1. `UNQUALIFIED`: Initial intake state before verification.
2. `PENDING`: Awaiting verification or additional guest details.
3. `QUALIFIED`: Verified travel dates, realistic party size, valid contact handle, and compatible budget.
4. `DISQUALIFIED`: Fails qualification criteria.

### Disqualification Reason Taxonomy
- `WRONG_PROVIDER`: Inquiry does not match provider's operational service offering.
- `INVALID_REQUEST`: Unrealistic logistics (e.g. asking for 5-star luxury at a remote forest camp).
- `DUPLICATE`: Repeated submission within short time window.
- `SPAM`: Automated promotional or abusive input.
- `OUT_OF_SERVICE_AREA`: Geographic destination outside provider's operating region.
- `INSUFFICIENT_INFORMATION`: Missing dates or contact method without response.
- `OTHER`: Explicit researcher-documented reason.
