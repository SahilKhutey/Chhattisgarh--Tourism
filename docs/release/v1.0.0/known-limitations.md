# Known Limitations & Roadmap — CG Tourism OS v1.0.0

This document outlines the known operating boundaries, constraints, and future roadmap items for CG Tourism OS v1.0.0.

---

## 1. Operating Boundaries & Known Constraints

### Geospatial Routing Precision
- **Current Behavior**: Routing between remote ecotourism clusters uses haversine distance matrices and precomputed regional road speed constants when external OSRM / Mapbox directions servers are offline or rate-limited.
- **Roadmap Item (v1.1)**: Deploy a self-hosted regional OSRM routing engine covering Chhattisgarh state highways and rural forest roads.

### Offline PWA Queue Capacity
- **Current Behavior**: The offline mutation queue in IndexedDB supports up to 50 queued actions (bookmarks, reviews, feedback) before prompting the user to connect to sync.
- **Roadmap Item (v1.1)**: Add delta-compression for large media uploads originating in zero-connectivity national parks.

### Dialectal Voice Recognition
- **Current Behavior**: Voice recognition supports Hindi and English out of the box via Web Speech API; Gondi and Halbi dialect queries rely on backend phonetic text matching against the regional glossary.
- **Roadmap Item (v1.2)**: Integrate localized Whisper-fine-tuned models for tribal phonetics and indigenous place names.

### Payment Gateway Provider
- **Current Behavior**: Implements Razorpay and standard webhook verification. Cash on arrival and UPI direct deep links are supported.
- **Roadmap Item (v1.1)**: Add support for regional cooperative bank payment gateways for rural artisan societies.

---

## 2. Maintenance & Operations Guidance

- **Redis Cache Invalidation**: When performing bulk place migrations in the database via direct SQL, execute `pnpm --filter backend exec ts-node -e "..."` or purge the Redis discovery cache keys to force fresh index generation.
- **Log Aggregation**: Application logs are formatted in JSON with `correlationId`. Ensure central log forwarder (FluentBit / Datadog / Vector) parses standard stdout streams.
