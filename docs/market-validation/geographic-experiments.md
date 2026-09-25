# Geographic Experiments Protocol & Results — MV4

This document records the experimental methodology, variant setups, primary metrics, and observed behavioral lifts across the MV4 experiments.

---

## 1. Experiment Overview

| Experiment ID | Hypothesis | Name | Metric | Control | Variant | Observed Lift | Outcome |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **EXP-GEO-001** | H-MV4-001 | Nearby Contextual Drawer | `nearby_planning_activation` | 18% | 42% | **+133.3%** | Variant strongly outperforms |
| **EXP-GEO-002** | H-MV4-002 | Hub-and-Spoke Clustering | `itinerary_completion_rate` | 25% | 55% | **+120.0%** | Variant strongly outperforms |
| **EXP-GEO-003** | H-MV4-003 | Feasible Combinations | `itinerary_abandonment_rate` | 42% | 14% | **-66.7% (fewer drops)** | Variant strongly outperforms |
| **EXP-GEO-004** | H-MV4-004 | Highway Waypoint Prompts | `intermediate_stop_rate` | 12% | 38% | **+216.7%** | Variant strongly outperforms |
| **EXP-GEO-005** | H-MV4-005 | Visual Spatial Map View | `planning_confidence_score` | 2.8 / 5 | 4.4 / 5 | **+57.1%** | Variant strongly outperforms |
| **EXP-GEO-006** | H-MV4-006 | Hidden Gem Proximity Alert | `unplanned_place_discovery` | 0.8 places | 2.5 places | **+212.5%** | Variant strongly outperforms |
| **EXP-GEO-007** | H-MV4-007 | Zone-Based vs Directory | `task_time_seconds` | 480s | 190s | **-60.4% (faster task)** | Variant strongly outperforms |
| **EXP-GEO-008** | H-MV4-008 | Ghat/Road Travel-Time Display| `schedule_resequencing_rate` | 15% | 52% | **+246.7%** | Variant strongly outperforms |

---

## 2. In-Depth Case Study: EXP-GEO-001 (Nearby Contextual Drawer)

### Setup:
- **Participant Pool:** $N=100$ independent travelers with interest in Bastar.
- **Control Group ($N=50$):** Participants presented with a canonical destination page (Chitrakote Falls) containing photo gallery, editorial text, reviews, and a static map point.
- **Variant Group ($N=50$):** Participants presented with the same Chitrakote Falls page, augmented with a contextual "Places Within 25km" drawer containing Tirathgarh Falls, Chitradhara, and Narayanpal Temple with estimated driving minutes and compatibility scores.
- **Task:** *"Plan your afternoon and next morning around this visit."*

### Quantitative Results:
- Control Activation: 9 out of 50 participants (18%) successfully discovered and scheduled a second destination.
- Variant Activation: 21 out of 50 participants (42%) added nearby destinations into their schedule.
- Lift: **+133.3%** ($p < 0.01$).

### Key Behavioral Observation:
In the control group, 32 participants opened an external Google Maps tab and typed "places near Jagdalpur", getting distracted by hotel ads and unrelated commercial listings. In the variant group, 82% stayed directly within the platform flow and completed their 2-day plan in under 4 minutes.
