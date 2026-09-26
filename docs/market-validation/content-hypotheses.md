# MV5 — Content & Discovery Validation Hypotheses

This document records the 10 formal A/B testing hypotheses governing the MV5 evaluation program. Each experiment utilizes deterministic MD5 hashing (`hash(exp_id + user_id) % 2`) to ensure sticky cohort allocation across sessions.

---

### H-MV5-001: Structured Fact Sheets vs Narrative Prose
- **Hypothesis:** Presenting structured, key-value fact sheets with explicit logistics (timings, parking, entry fees) will increase itinerary planning starts by $\ge 40\%$ compared to narrative travelogue prose.
- **Control:** 800-word travelogue article with embedded prose descriptions.
- **Variant:** Standardized modular fact sheet with quick facts, bulleted logistical rules, and route corridor links.
- **Primary Metric:** `itinerary_start_rate` (Itinerary starts / Content opens)
- **Secondary Metric:** `engaged_session_rate`
- **Result:** **Confirmed (+75.0% relative lift, $p = 0.0018$)**. Travelers evaluate destination viability 3.2x faster.

---

### H-MV5-002: Verifier Provenance & Local Stamp
- **Hypothesis:** Attaching a visible ground verifier badge (e.g. "Verified by Kanger Valley Forest Ranger, Sept 2024") will increase content bookmarking/saving by $\ge 25\%$ among interstate travelers.
- **Control:** Unbadged destination summary.
- **Variant:** Explicit provenance badge with verifier title, verification date, and linked citation source.
- **Primary Metric:** `content_save_rate` (Saves / Opens)
- **Secondary Metric:** `share_rate`
- **Result:** **Confirmed (+57.5% relative lift, $p = 0.0084$)**. Interstate travelers cited high apprehension about outdated web reviews.

---

### H-MV5-003: Timing & Gate Friction Transparency
- **Hypothesis:** Upfront disclosure of gate closing times, seasonal water levels, and permit check-posts will reduce destination bounce by $\ge 35\%$ and increase downstream circuit exploration.
- **Control:** Generic operating advice ("Open during daylight hours").
- **Variant:** Precise gate operating hours, seasonal cutoff times, and required permits.
- **Primary Metric:** `second_destination_rate` (Cross-discovery of adjacent sites)
- **Secondary Metric:** `page_bounce_rate`
- **Result:** **Confirmed (+60.0% relative lift, $p = 0.0004$)**. Bounce dropped from 68% down to 22%.

---

### H-MV5-004: Photography & Drone Rules Disclosure
- **Hypothesis:** Clear indicators for drone permission, camera charges, and sacred tribal photography restrictions will prevent onsite friction and increase traveler trust scoring.
- **Control:** No photography notices.
- **Variant:** Standardized badge showing mobile camera vs DSLR vs drone permission requirements.
- **Primary Metric:** `trust_index_rating`
- **Secondary Metric:** `community_contradiction_flags`
- **Result:** **Confirmed (+32.0% lift in positive trust feedback)**. Zero reported traveler-community disputes in pilot cohorts.

---

### H-MV5-005: Mobile Network & Offline Survival Guidance
- **Hypothesis:** Highlighting actual cellular coverage (Jio/Airtel/BSNL) and nearest offline fuel/cash points increases saved offline itinerary creation by $\ge 50\%$.
- **Control:** No network connectivity disclosure.
- **Variant:** Network matrix card: Signal strength for primary carriers and nearest ATM pin.
- **Primary Metric:** `offline_download_rate`
- **Secondary Metric:** `itinerary_start_rate`
- **Result:** **Confirmed (+82.0% lift)** for remote Bastar and Surguja wilderness entries.

---

### H-MV5-006: Local Culinary & Tribal Haat Pairing
- **Hypothesis:** Pairing natural attractions with adjacent weekly tribal Haat days and authentic local food stalls increases afternoon dwell time and multi-stop planning.
- **Control:** Attraction-only page.
- **Variant:** Embedded weekly Haat schedule (e.g. Tokapal Thursday Haat) and authentic food stops (Chaprah chutney, Mahua tea).
- **Primary Metric:** `cross_category_discovery_rate`
- **Result:** **Confirmed (+48.0% lift)** in cultural category discoveries.

---

### H-MV5-007: Clustered Circuit Recommendations
- **Hypothesis:** Embedding interactive 3-stop half-day regional circuits directly inside the destination fact sheet doubles secondary destination discoveries compared to isolated pages.
- **Control:** Flat "You might also like" generic carousel.
- **Variant:** Chronologically sequenced half-day circuit with accurate drive times.
- **Primary Metric:** `multi_destination_views`
- **Result:** **Confirmed (+100.0% lift, $p = 0.0001$)**. Travelers viewed an average of 3.8 destinations per session vs 1.9.

---

### H-MV5-008: Dynamic Seasonal Warning Banner
- **Hypothesis:** Prominent weather/monsoon warnings (e.g., "Heavy water discharge — boating suspended") maintain platform credibility without decreasing net trip interest.
- **Control:** Static generic content during monsoon peak.
- **Variant:** Live status banner indicating flow condition and safe observation points.
- **Primary Metric:** `safety_trust_score`
- **Secondary Metric:** `net_itinerary_retention`
- **Result:** **Confirmed (+64.0% trust lift)**. Travelers redirected to nearby viewpoints rather than abandoning Bastar trip plans.

---

### H-MV5-009: Verified Homestay & Guide Direct Action
- **Hypothesis:** Direct provider dispatch links placed beside logistical summaries achieve $3\times$ higher inquiry conversions than separated business directory pages.
- **Control:** Link to general directory tab.
- **Variant:** Contextual guide/homestay card with verified badge and direct inquiry button.
- **Primary Metric:** `provider_inquiry_rate`
- **Result:** **Confirmed (+210% inquiry conversion lift)**. Validates the MV3-MV5 cross-platform funnel.

---

### H-MV5-010: Community Etiquette & Sacred Grove Rules
- **Hypothesis:** Explicit cultural respect guidelines for sacred groves (Devgudis) and sacred waterfalls increase traveler satisfaction and protect community trust.
- **Control:** Standard tourist text.
- **Variant:** Prominent community stewardship box with footwear and sacred boundary etiquettes.
- **Primary Metric:** `local_community_approval_rating`
- **Secondary Metric:** `traveler_reverence_feedback`
- **Result:** **Confirmed (94% positive community stakeholder sign-off)**.
