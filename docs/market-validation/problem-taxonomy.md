# Problem Taxonomy & Pain Scoring Methodology

## 1. Problem Taxonomy Tree

```text
DISCOVERY
├── destination discovery      # "I don't know what exists beyond Chitrakote"
├── hidden destinations        # "Can't find reliable info on off-grid waterfalls"
└── interest matching          # "Can't filter places by specific cultural interests"

INFORMATION
├── completeness               # "Missing opening hours, permit rules, fuel stops"
├── freshness                  # "Waterfall was dry / temple was closed"
├── trust                      # "Photos on blogs are 10 years old or edited"
└── verification               # "Cannot verify road drivability for sedan"

GEOGRAPHY
├── nearby                     # "Don't know what else is within 25 km of where I am"
├── distance & time            # "Google Maps estimates 2 hrs, actual took 4.5 hrs"
├── route feasibility          # "Are these 3 spots along the same road or opposite hills?"
└── regional relationships     # "How to sequence Bastar -> Dantewada efficiently"

PLANNING
├── itinerary realism          # "Overambitious plan; spent all day driving in the dark"
├── time & pacing              # "Unclear how long to spend at Kotumsar caves"
└── multi-party coordination   # "Hard to share and agree on a coherent route"

EXPERIENCE
├── local culture              # "Don't know local customs / tribal photography rules"
├── guides                     # "Cannot find verified local forest guides"
├── food                       # "Where to eat authentic Chhattisgarhi / Bastar food"
└── activities                 # "No structured way to book pottery/Dhokra workshops"

TRANSACTION
├── accommodation              # "Homestays not listed on Booking or MakeMyTrip"
├── booking friction           # "Must call random mobile number on a WhatsApp group"
├── provider contact           # "Numbers found on blogs are switched off"
└── payment reliability        # "No cash / UPI failure in forest zones"

TRAVEL & SAFETY
├── navigation in dead zones   # "Google Maps failed when mobile network dropped"
├── connectivity               # "Zero cellular connectivity in Kanger Valley"
├── safety & forest permits    # "Unsure about night driving safety"
└── transport options          # "No public buses / extortionate private taxi quotes"
```

## 2. Quantitative Pain Scoring Formula

Each recorded problem is evaluated on five integer scales (1 to 5):
1. **Frequency ($F$):** How often the problem occurs for travelers (1 = rare anomaly, 5 = ubiquitous).
2. **Severity ($S$):** How disruptive the problem is (1 = minor annoyance, 5 = trip-ruining).
3. **Time Cost ($T$):** Wasted planning or transit time (1 = <5 mins, 5 = hours lost).
4. **Trust Impact ($Tr$):** Erosion of traveler confidence (1 = none, 5 = abandonment).
5. **Financial Cost ($C$):** Direct monetary loss (tracked separately: 1 = nil, 5 = high expense).

### The Canonical Formula
$$\text{Pain Score} = \text{Frequency} \times \text{Severity} \times \text{Time Cost} \times \text{Trust Impact}$$
$$\text{Range: } [1, 625]$$

- **Tier 1 (High Urgency):** Score $\ge 240$ (e.g., $5 \times 4 \times 4 \times 4 = 320$). Immediate candidate for OS solution.
- **Tier 2 (Moderate Friction):** Score $100 - 239$.
- **Tier 3 (Low Priority):** Score $< 100$.
