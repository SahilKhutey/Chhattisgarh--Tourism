# Route & Corridor Feasibility Validation — MV4

## 1. The Real-World Route Problem in Chhattisgarh
In many tourist states, routing is trivial because four-lane expressways connect major attractions. In Chhattisgarh, geography is defined by:
- Forest tracts and National Parks (Kanger Valley, Barnawapara).
- Ghat sections and single-lane hill roads (Keshkal Ghat, Bailadila ghats).
- Early dusk in tribal forest regions (travelers must reach safe bases before 6:30 PM).
- Inconsistent mobile networks (routing algorithms that rely on real-time internet fail).

Travelers routinely draft unrealistic itineraries (e.g. attempting Ambikapur in North Chhattisgarh to Jagdalpur in South Chhattisgarh on a single day's drive—exceeding 15 hours on state roads).

---

## 2. Route Feasibility Categorization Rules
The system enforces automated feasibility classification based on driving duration, terrain, and intermediate stops:

$$\text{Total Duration } T_{total} = T_{direct} + \sum_{i=1}^{k} (T_{stop\_i} + \Delta T_{detour\_i})$$

1. **`FEASIBLE` (Green):**
   - $T_{total} \le 600\text{ minutes}$ (10 hours max driving per day).
   - Allows safe daylight transit with scheduled meal/cultural breaks.
2. **`DIFFICULT` (Amber):**
   - $600\text{ mins} < T_{total} \le 840\text{ mins}$ (10 to 14 hours).
   - Feasible only with two drivers, an early dawn departure, or an unavoidable long transit leg. A warning is presented advising an overnight layover (e.g. in Kanker).
3. **`UNREALISTIC` (Red):**
   - $T_{total} > 840\text{ minutes}$ ($>14$ hours).
   - Flagged as physically unsafe and unachievable within a single calendar day. The platform forces an itinerary split into multi-day segments.

---

## 3. Validated Corridors Benchmarks

| Corridor Name | Route Sequence | Distance | Typical Duration | Mode | Status | Key Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Bastar Grand Highway** | Raipur $\rightarrow$ Kanker $\rightarrow$ Kondagaon $\rightarrow$ Jagdalpur | 295 km | 6h 30m | Car / Bus | `FEASIBLE` | NH30; Keshkal Ghat has scenic viewpoints; stop at Kondagaon for bell metal. |
| **Bastar Waterfall Loop**| Jagdalpur $\rightarrow$ Chitrakote $\rightarrow$ Tirathgarh $\rightarrow$ Jagdalpur | 115 km | 3h 15m | Car / Bike | `FEASIBLE` | Best executed across 2 days, but physically feasible as a 1-day loop. |
| **Kanger Cave Safari** | Jagdalpur $\rightarrow$ Kotumsar Cave $\rightarrow$ Kanger Dhara | 65 km | 2h 00m | Car / Jeep | `FEASIBLE` | Forest department permits required before 2:00 PM; rocky terrain. |
| **Cross-State Extreme** | Ambikapur $\rightarrow$ Jagdalpur (North to South) | 680 km | 15h 20m | Car | `UNREALISTIC` | Unsafe for single-day driving; requires mandatory stay in Raipur/Bilaspur. |
| **Southern Temple Run** | Jagdalpur $\rightarrow$ Dantewada $\rightarrow$ Barsoor $\rightarrow$ Jagdalpur | 190 km | 4h 45m | Car | `FEASIBLE` | Good double-lane road; historical twin Ganesha temple in Barsoor. |
