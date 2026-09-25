# Pilot Region Architecture: Bastar Division — MV4

## 1. Why Bastar as the Primary Validation Pilot?
Bastar Division was selected as the flagship pilot zone for MV4 for five compelling reasons:

1. **High Tourist Appeal but High Planning Friction:** Bastar holds world-class natural and cultural assets (Chitrakote Falls, Tirathgarh, Kanger Valley National Park, Kotumsar Caves, Dhokra handicraft villages, Danteshwari Temple), but travelers consistently report severe anxiety regarding distances, road safety, mobile signal dead zones, and realistic trip pacing.
2. **True Hub-and-Spoke Dynamics:** Jagdalpur acts as the natural gateway and central urban base ($19.0735^\circ\text{N}, 82.0289^\circ\text{E}$), surrounded by diverse radial excursion spokes within 20km to 85km.
3. **Multi-Stop Corridor Density:** The Raipur $\rightarrow$ Kanker $\rightarrow$ Kondagaon $\rightarrow$ Jagdalpur $\rightarrow$ Dantewada corridor (NH30) provides the exact terrain needed to test route sequencing and intermediate wayside discovery.
4. **Supply-Side Interlock:** Complements the homestays, local tribal guides, and artisans validated in MV3.
5. **Clear Regional Identity:** Avoids the blur of urban day-tripping and rigorously tests destination relationship clustering.

---

## 2. Key Destinations in Pilot Topology

| Destination ID | Name | District | Lat / Lon | Tourism Type | Role in Regional Graph |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `DEST_JAGDALPUR` | Jagdalpur Central | Bastar | 19.0735, 82.0289 | `HERITAGE` | **Primary Gateway & Hub** (Hotel base, transit link, palace) |
| `DEST_CHITRAKOTE` | Chitrakote Falls | Bastar | 19.2017, 81.7061 | `WATERFALL` | **Anchor Attraction** (~38.5 km NW of Jagdalpur, sunset hub) |
| `DEST_TIRATHGARH` | Tirathgarh Falls | Bastar | 18.9167, 81.8667 | `WATERFALL` | **Cluster Spoke** (~30 km SW of Jagdalpur, morning visit) |
| `DEST_KANGER_CAVE`| Kotumsar Caves & Park | Bastar | 18.8833, 81.9333 | `WILDLIFE` | **Complementary Attraction** (~28 km S, paired with Tirathgarh) |
| `DEST_DANTEWADA` | Danteshwari Temple | Dantewada| 18.8950, 81.3490 | `TEMPLE` | **Spiritual Heritage Hub** (~85 km SW of Jagdalpur) |
| `DEST_KONDAGAON` | Craft Village (Bell Metal)| Kondagaon | 19.5960, 81.6660 | `CRAFT` | **Highway Waypoint** (NH30 corridor stop) |
| `DEST_KANKER` | Kanker Palace | Kanker | 20.2719, 81.4930 | `HERITAGE` | **Northern Gateway** (Midpoint stop between Raipur & Bastar) |

---

## 3. Spatial Relationship Clustering

```
                     [RAIPUR] (Capital Gateway)
                        │
                      (NH30 - 130 km)
                        ↓
                     [KANKER] (Heritage Gateway)
                        │
                      (NH30 - 75 km)
                        ↓
                    [KONDAGAON] (Handicraft Waypoint)
                        │
                      (NH30 - 70 km)
                        ↓
                 ┌──[JAGDALPUR]──┐ (Urban & Stay Hub)
                 │      │        │
           (38 km)   (30 km)   (85 km)
                 ↓      ↓        ↓
            Chitrakote Tirathgarh Dantewada
                 │      │
          Chitradhara Kotumsar Caves
```

---

## 4. Expansion Plan Post-Validation
With Bastar reaching a Geographic Utility Score of **4.25 / 5.0**, the expansion roadmap proceeds to:
1. **Surguja Northern Zone:** Mainpat Tibetan settlement, Ramgarh caves, Tatapani geothermal springs, Ambikapur hub.
2. **Raipur Central Corridor:** Sirpur archaeological complex, Barnawapara sanctuary, Champaran, Rajim Panchkoshi.
