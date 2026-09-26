# Cross-Side Network Effects & Network Health Score

## 1. Topological Network Graph

The CG Tourism ecosystem operates as a multi-sided graph:

```
                Traveler
               /    |    \
              /     |     \
    Destination   Trip    Provider
         |          |
      Creator    Review
```

---

## 2. Interaction Density Formulation

$$\text{Interaction Density} = \frac{\text{Total Meaningful Interactions}}{\text{Total Active Travelers} + \text{Active Providers} + \text{Active Creators}}$$

Meaningful interaction density above **3.0 interactions per active user** indicates an active ecosystem with multi-sided liquidity.

---

## 3. Network Health Score Formula

$$\text{NHS} = (0.25 \cdot SQ) + (0.20 \cdot CQ) + (0.20 \cdot TA) + (0.20 \cdot ID) + (0.15 \cdot TS)$$

Where:
- $SQ$: Supply Quality (% active verified providers).
- $CQ$: Content Quality (% destinations with verified fact sheets).
- $TA$: Traveler Activity (volume of active trip plans).
- $ID$: Interaction Density (cross-side interactions per active node).
- $TS$: Transaction Success (completed booking conversion rate).

Pilot benchmark: **78.4 / 100**, categorized as `DEVELOPING_REGIONAL_ECOSYSTEM`.
