# Participant Segments & Recruitment Policy

## 1. Participant Segments Taxonomy

| Segment Code | Description | Typical Motivation | Tech Literacy |
| :--- | :--- | :--- | :--- |
| `LOCAL_RESIDENT` | Resident of Chhattisgarh (Raipur, Bilaspur, Durg) | Weekend getaways, hidden spots, family day trips | High / Smartphone native |
| `CG_TRAVELER` | Active intra-state traveler | Regular regional circuit exploration | Medium to High |
| `INTERSTATE_TRAVELER` | Domestic traveler from outside CG (Delhi, Mumbai, Bengaluru, Hyderabad) | Offbeat cultural immersion, waterfalls, tribal heritage | High |
| `INTERNATIONAL_TRAVELER` | Overseas visitor | Tribal arts, anthropological interest, wildlife | High (English reliant) |
| `SOLO_TRAVELER` | Independent traveler | High flexibility, safety-conscious, budget-sensitive | Very High |
| `COUPLE` | Traveling as partners | Quality of stay, scenic nature, privacy | High |
| `FAMILY` | Multi-generational travel | Clean facilities, road accessibility, predictable timings | Medium |
| `GROUP` | Friends / College alumni | Shared experiences, adventure, campfires | High |
| `BACKPACKER` | Low budget, high duration | Public transit, homestays, authentic interactions | High |
| `ADVENTURE_TRAVELER` | Trekking, caving, kayaking | Topographical safety, permits, trail accuracy | High |
| `CULTURAL_TRAVELER` | Heritage, Bastar Dussehra, handicrafts | Historical authenticity, artisan access, festivals | Medium |
| `NATURE_TRAVELER` | Waterfalls, biodiversity, sal forests | Seasonal timings, tranquility, landscape photography | Medium |
| `PILGRIMAGE_TRAVELER` | Temples (Dongargarh, Sirpur, Dantewada) | Ritual timings, lodging for elders, crowd schedules | Low to Medium |
| `WILDLIFE_TRAVELER` | Barnawapara, Achanakmar, Kanger Valley | Safari bookings, sighting corridors, naturalist guides | High |

## 2. Multi-Attribute Behavioral Tagging
Participants are NOT restricted to a single rigid segment. A participant can have a primary segment (`INTERSTATE_TRAVELER`) and multiple behavioral tags:
```json
{
  "segment": "INTERSTATE_TRAVELER",
  "traveler_types": ["SOLO_TRAVELER", "CULTURAL_TRAVELER", "BACKPACKER"]
}
```

## 3. Privacy & Recruitment Policy
- **No Sensitive PII:** Aadhaar numbers, PAN, bank accounts, and exact home GPS coordinates are strictly rejected at the schema level.
- **Anonymous ID:** All participants receive a deterministic research ID (`PART-XXXXXXXX`).
- **Informed Consent:** Explicit consent for research recording and anonymized quote usage is mandatory.
