# MV3 — Tourism Supply-Side Validation

## 1. Executive Objective & Strategic Shift
MV1 established the competitive landscape. MV2 validated real traveler problems and multi-tool planning friction.
MV3 now validates the other half of the marketplace: **The Tourism Supply Side**.

> "Will tourism businesses and local experience providers participate, maintain their information, respond to demand, and eventually pay for qualified demand?"

```
                       REAL-WORLD SUPPLY ACTORS
          (Homestays · Local Guides · Dhokra Artisans · Taxi Drivers)
                               │
               ┌───────────────┼───────────────┐
               ↓               ↓               ↓
          Acquisition     Onboarding        Listing
          (Offline/Direct) (7-Step Flow)  (Quality 0–100)
               │               │               │
               └───────────────┼───────────────┘
                               ↓
                        CG TOURISM OS
                               │
       ┌───────────────────────┼───────────────────────┐
       ↓                       ↓                       ↓
    Exposure              Lead Engine              Response
 (Traveler Views)      (Qualified Intent)      (SLA Response Time)
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               ↓
                     Conversion & Booking
                               ↓
                 Perceived Provider Value & Retention
```

## 2. Fundamental Distinction: Validation Before Commerce Infrastructure
We deliberately do **NOT** build:
- Heavy payment gateways
- Complex commission settlement engines
- Invoicing and automated payouts

Instead, we validate the underlying economic engine:
$$\text{Discovery} \rightarrow \text{Qualified Lead} \rightarrow \text{Provider Response} \rightarrow \text{Booking} \rightarrow \text{Provider Value}$$

## 3. Supply Taxonomy & Provider Segments

### Provider Types:
- **ACCOMMODATION:** `HOTEL`, `HOMESTAY`, `RESORT`, `GUESTHOUSE`, `CAMPING`
- **EXPERIENCE:** `LOCAL_GUIDE`, `TOUR_OPERATOR`, `ADVENTURE_PROVIDER`, `WILDLIFE_EXPERIENCE`, `CULTURAL_EXPERIENCE`, `COMMUNITY_EXPERIENCE`
- **FOOD:** `RESTAURANT`, `LOCAL_FOOD`, `CAFE`, `FOOD_EXPERIENCE`
- **TRANSPORT:** `TAXI`, `LOCAL_TRANSPORT`, `TOUR_TRANSPORT`, `RENTAL`
- **CULTURAL:** `ARTISAN`, `CRAFT`, `CULTURAL_ORGANIZATION`, `COMMUNITY_ORGANIZATION`
- **CREATOR:** `PHOTOGRAPHER`, `VIDEOGRAPHER`, `TRAVEL_CREATOR`, `LOCAL_STORYTELLER`

### Digital Maturity Tiers:
1. `OFFLINE_ONLY` — No digital presence; phone/walk-in only.
2. `BASIC_DIGITAL` — Phone numbers on WhatsApp/Facebook.
3. `SOCIAL_FIRST` — Active Instagram/Reels, no booking engine.
4. `MARKETPLACE_PRESENT` — Listed on Google Maps or OTAs.
5. `DIGITALLY_MATURE` — Full digital management, responsive reservations.

## 4. Key Supply-Side Hypotheses
- **H-MV3-001:** Tourism providers have insufficient digital discovery in offbeat corridors.
- **H-MV3-002:** Providers want more qualified tourist inquiries rather than spam calls.
- **H-MV3-003:** Providers will complete a structured 7-step tourism listing.
- **H-MV3-004:** Providers will maintain accurate pricing and seasonal availability.
- **H-MV3-005:** Tourism providers will respond to qualified digital leads within 2 hours.
- **H-MV3-006:** Local artisans and guides perceive measurable economic value from qualified leads.
- **H-MV3-007:** Providers will continue using CG Tourism after experiencing positive lead conversion.

## 5. Normalized Listing Quality Score ($0 - 100$)
$$\text{Raw Score} = \text{Info} (20) + \text{Media} (20) + \text{Location} (20) + \text{Service} (20) + \text{Contact} (20) + \text{Trust} (20) = 120$$
$$\text{Listing Quality} = \text{round}\left(\frac{\text{Raw Score}}{120} \times 100\right)$$

## 6. Lead Qualification Criteria
A lead is **Qualified** if and only if:
1. **Traveler Intent:** Date, duration, or group size is specified.
2. **Relevant Request:** Matches provider's operational capability.
3. **Actionable Contact:** Valid contact route provided.
