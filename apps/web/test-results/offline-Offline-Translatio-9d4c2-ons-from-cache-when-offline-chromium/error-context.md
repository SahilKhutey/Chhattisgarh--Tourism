# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: offline.spec.ts >> Offline Translation Capabilities >> Loads dynamic translations from cache when offline
- Location: tests\e2e\offline.spec.ts:4:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "cg"
Received: null
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "CG CG TOURISM OS Discover the Real" [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e5]: CG
        - generic [ref=e6]:
          - generic [ref=e7]: CG TOURISM OS
          - generic [ref=e8]: Discover the Real
      - navigation [ref=e9]:
        - link "Map Discovery" [ref=e10] [cursor=pointer]:
          - /url: /explore
        - link "AI Planner" [ref=e11] [cursor=pointer]:
          - /url: /planner
        - link "Creator Studio" [ref=e12] [cursor=pointer]:
          - /url: /creator
        - link "Saved Journeys" [ref=e13] [cursor=pointer]:
          - /url: /bookmarks
        - link "Folklore Stories" [ref=e14] [cursor=pointer]:
          - /url: /stories
        - link "Emergency SOS" [ref=e15] [cursor=pointer]:
          - /url: /sos
          - text: Emergency SOS
      - generic [ref=e17]:
        - generic [ref=e18]:
          - img [ref=e19]
          - button "EN" [ref=e22]
          - generic [ref=e23]: "|"
          - button "हिन्दी" [ref=e24]
          - generic [ref=e25]: "|"
          - button "छत्तीसगढ़ी" [ref=e26]
        - button "👁️ Easy Read" [ref=e27] [cursor=pointer]:
          - generic [ref=e28]: 👁️
          - generic [ref=e29]: Easy Read
        - link "Log In" [ref=e30] [cursor=pointer]:
          - /url: /login
        - link "Sign Up" [ref=e31] [cursor=pointer]:
          - /url: /register
        - link "Plan Trip" [ref=e32] [cursor=pointer]:
          - /url: /planner
  - main [ref=e33]:
    - generic [ref=e34]:
      - generic [ref=e35]:
        - img "Misty Chitrakote Horseshoe Gorge" [ref=e37]
        - img "Dense Sal Forest of Bastar" [ref=e40]
        - img "Ancient Sirpur Brick Temples" [ref=e43]
        - generic [ref=e46]:
          - generic [ref=e47]:
            - img [ref=e48]
            - text: Chhattisgarh Sustainable Travel Portal
          - heading "Discover the Real & Authentic" [level=1] [ref=e53]
          - paragraph [ref=e54]: Experience the majestic power of Indravati River's flow.
          - generic [ref=e55]:
            - link "Explore Interactive Map" [ref=e56] [cursor=pointer]:
              - /url: /explore
              - img [ref=e57]
              - text: Explore Interactive Map
            - link "Join Verified Creators" [ref=e59] [cursor=pointer]:
              - /url: /creator
              - img [ref=e60]
              - text: Join Verified Creators
        - generic [ref=e64]:
          - button [ref=e65]
          - button [ref=e66]
          - button [ref=e67]
      - generic [ref=e68]:
        - generic [ref=e69]:
          - generic [ref=e70]: Discovery Gateways
          - heading "Explore Core Experiences" [level=2] [ref=e71]
          - paragraph [ref=e72]: Filter deep through specialized regional layers curated to uncover raw tribal art, sacred waterfalls, and historical routes.
        - generic [ref=e73]:
          - link "🌊 Waterfalls Monsoon cascades" [ref=e74] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e75]: 🌊
            - heading "Waterfalls" [level=4] [ref=e76]
            - generic [ref=e77]: Monsoon cascades
          - link "🌳 Dense Forests Sal canopy trails" [ref=e78] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e79]: 🌳
            - heading "Dense Forests" [level=4] [ref=e80]
            - generic [ref=e81]: Sal canopy trails
          - link "🏛️ Temples & Archeology Ancient ruins" [ref=e82] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e83]: 🏛️
            - heading "Temples & Archeology" [level=4] [ref=e84]
            - generic [ref=e85]: Ancient ruins
          - link "🧗 Adventure Trails Caves & gorges" [ref=e86] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e87]: 🧗
            - heading "Adventure Trails" [level=4] [ref=e88]
            - generic [ref=e89]: Caves & gorges
          - link "🍲 Tribal Gastronomy Indigenous Mahua & Roti" [ref=e90] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e91]: 🍲
            - heading "Tribal Gastronomy" [level=4] [ref=e92]
            - generic [ref=e93]: Indigenous Mahua & Roti
          - link "💎 Hidden Gems Secret pristine valleys" [ref=e94] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e95]: 💎
            - heading "Hidden Gems" [level=4] [ref=e96]
            - generic [ref=e97]: Secret pristine valleys
          - link "👺 Tribal Arts Dhokra & Bell Metal" [ref=e98] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e99]: 👺
            - heading "Tribal Arts" [level=4] [ref=e100]
            - generic [ref=e101]: Dhokra & Bell Metal
          - link "🐯 Wildlife Reserves Tiger & bison domains" [ref=e102] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e103]: 🐯
            - heading "Wildlife Reserves" [level=4] [ref=e104]
            - generic [ref=e105]: Tiger & bison domains
          - link "📸 Photography Spots Unseen panoramic vistas" [ref=e106] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e107]: 📸
            - heading "Photography Spots" [level=4] [ref=e108]
            - generic [ref=e109]: Unseen panoramic vistas
          - link "🌱 Eco Tourism Community homestays" [ref=e110] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e111]: 🌱
            - heading "Eco Tourism" [level=4] [ref=e112]
            - generic [ref=e113]: Community homestays
      - generic [ref=e115]:
        - generic [ref=e116]:
          - generic [ref=e117]: Smart Telemetry Hub
          - heading "Find Nearby Unexplored Corridors" [level=2] [ref=e118]
          - paragraph [ref=e119]: Enable your location sensor to calculate distance parameters to surrounding waterfalls, sanctuaries, and guides in real-time. All coordinates are handled locally for offline resilience.
          - generic [ref=e120]:
            - button "Activate Location" [ref=e121] [cursor=pointer]:
              - img [ref=e122]
              - text: Activate Location
            - generic [ref=e125]:
              - text: "Status:"
              - strong [ref=e126]: Enable location to calculate distances to Sirpur, Chitrakote, or Kutumsar caves.
        - generic [ref=e128]:
          - img [ref=e129]
          - generic [ref=e132]: Telemetry deactivated
          - generic [ref=e133]: Enable location to calculate distances to Sirpur, Chitrakote, or Kutumsar caves.
      - generic [ref=e134]:
        - generic [ref=e135]:
          - generic [ref=e136]: Intelligent Travel Tides
          - heading "Seasonal Escapes & Routes" [level=2] [ref=e137]
          - paragraph [ref=e138]: Chhattisgarh changes character dramatically with the sun and rain. Tap below to navigate based on seasonal road access and weather safety parameters.
        - generic [ref=e139]:
          - generic [ref=e140]:
            - generic [ref=e141]:
              - img [ref=e143]
              - heading "Monsoon (July - Oct)" [level=3] [ref=e145]
            - heading "Waterfalls Expedition" [level=4] [ref=e146]
            - paragraph [ref=e147]: Chitrakote and Tirathgarh roar with unmatched volume. The forest is absolute vibrant green.
            - generic [ref=e148]:
              - generic [ref=e149]: Top Monitored Nodes
              - generic [ref=e150]:
                - generic [ref=e151]: Chitrakote Waterfalls
                - generic [ref=e152]: Tirathgarh Waterfalls
          - generic [ref=e153]:
            - generic [ref=e154]:
              - img [ref=e156]
              - heading "Winter (Nov - Feb)" [level=3] [ref=e162]
            - heading "Wildlife & Heritage Trails" [level=4] [ref=e163]
            - paragraph [ref=e164]: Perfect cool climate to discover archaeological relics at Sirpur and spot dynamic bison herds in reserve corridors.
            - generic [ref=e165]:
              - generic [ref=e166]: Top Monitored Nodes
              - generic [ref=e167]:
                - generic [ref=e168]: Sirpur Heritage Complex
                - generic [ref=e169]: Kanger Valley National Park
          - generic [ref=e170]:
            - generic [ref=e171]:
              - img [ref=e173]
              - heading "Summer (March - June)" [level=3] [ref=e175]
            - heading "Cool Forest Canopies & Caves" [level=4] [ref=e176]
            - paragraph [ref=e177]: Escape the heat inside deep subterranean Kutumsar limestone caves, maintaining standard cool temperatures year-round.
            - generic [ref=e178]:
              - generic [ref=e179]: Top Monitored Nodes
              - generic [ref=e180]:
                - generic [ref=e181]: Kanger Valley National Park
                - generic [ref=e182]: Bhoramdeo Temple
      - generic [ref=e183]:
        - generic [ref=e184]:
          - generic [ref=e185]:
            - generic [ref=e186]: Signature Travel Hubs
            - heading "Immersive Destination Chronicles" [level=2] [ref=e187]
          - link "Explore interactive maps" [ref=e188] [cursor=pointer]:
            - /url: /explore
            - text: Explore interactive maps
            - img [ref=e189]
        - generic [ref=e191]:
          - generic [ref=e192]:
            - generic [ref=e193]:
              - img "Chitrakote Waterfalls" [ref=e194]
              - generic [ref=e195]: Waterfalls
              - generic [ref=e197]:
                - generic [ref=e198]: ★ 4.9 Rating
                - heading "Chitrakote Waterfalls" [level=3] [ref=e199]
            - generic [ref=e200]:
              - paragraph [ref=e201]: "\"The Majestic 'Niagara of India'\""
              - paragraph [ref=e202]: According to ancient Bastar folk belief, the Indravati river is a mother goddess descending from the heavens. Chitrakote is where she showcases her supreme cosmic energy (Shakti). Local tribal elders narrate that during the monsoon, the heavy roar of the waterfall represents the celestial drums of Lord Shiva. The mist rising from the gorge is believed to carry the prayers of the forest spirits directly to the heavens.
              - generic [ref=e203]:
                - generic [ref=e204]: "BIODIVERSITY: 92%"
                - link "View Story Details" [ref=e205] [cursor=pointer]:
                  - /url: /destination/chitrakote-falls
                  - text: View Story Details
                  - img [ref=e206]
          - generic [ref=e209]:
            - generic [ref=e210]:
              - img "Sirpur Heritage Complex" [ref=e211]
              - generic [ref=e212]: Temples & Archeology
              - generic [ref=e214]:
                - generic [ref=e215]: ★ 4.8 Rating
                - heading "Sirpur Heritage Complex" [level=3] [ref=e216]
            - generic [ref=e217]:
              - paragraph [ref=e218]: "\"Ancient Crimson Brickwork & Lost Dynasties\""
              - paragraph [ref=e219]: Sirpur, historically known as Shripura, was the ancient capital of Panduvansh kings in the 6th century. The centerpiece, Laxman Temple, stands as one of the finest surviving brick temples in India. Constructed with intricately carved red clay bricks, it was funded by Queen Vasata in memory of her late husband. Archaeological excavations reveal that Sirpur was a major international center for Buddhist, Hindu, and Jain learning, outdating even the famous Nalanda University.
              - generic [ref=e220]:
                - generic [ref=e221]: "BIODIVERSITY: 78%"
                - link "View Story Details" [ref=e222] [cursor=pointer]:
                  - /url: /destination/sirpur-monuments
                  - text: View Story Details
                  - img [ref=e223]
          - generic [ref=e226]:
            - generic [ref=e227]:
              - img "Bhoramdeo Temple" [ref=e228]
              - generic [ref=e229]: Temples & Archeology
              - generic [ref=e231]:
                - generic [ref=e232]: ★ 4.7 Rating
                - heading "Bhoramdeo Temple" [level=3] [ref=e233]
            - generic [ref=e234]:
              - paragraph [ref=e235]: "\"The 'Khajuraho of Chhattisgarh'\""
              - paragraph [ref=e236]: Nestled in the lush Maikal Hills, Bhoramdeo was built by King Ramachandra of the Phani Nagvanshi dynasty in the 11th century. Dedicated to Lord Shiva, its design blends Nagara temple style with local tribal Gond symbolism. The temple walls are carved with incredible depictions of mythological deities, warriors, mythical beasts, and sensual carvings. It gets its name from 'Bhoramdeo', an ancient tribal deity of the Gond community who is worshipped here alongside Shiva.
              - generic [ref=e237]:
                - generic [ref=e238]: "BIODIVERSITY: 88%"
                - link "View Story Details" [ref=e239] [cursor=pointer]:
                  - /url: /destination/bhoramdeo-temple
                  - text: View Story Details
                  - img [ref=e240]
      - generic [ref=e243]:
        - generic [ref=e244]:
          - generic [ref=e245]: Ecological Protocol
          - heading "Responsible Traveler Directives" [level=2] [ref=e246]
          - paragraph [ref=e247]: As a community-powered space, we respect local customs, protect deep Sal sanctuaries, and strictly enforce visual carrying limits.
        - generic [ref=e248]:
          - generic [ref=e249]:
            - button "Eco Awareness & Carrying Capacity" [ref=e250] [cursor=pointer]:
              - generic [ref=e251]:
                - img [ref=e253]
                - heading "Eco Awareness & Carrying Capacity" [level=3] [ref=e256]
              - img [ref=e257]
            - generic [ref=e259]: Our forest trails operate under strict ecological load regulations. When visiting reserves like Kanger Valley, limit plastics, pack out waste, and abide by group sizes set by forestry rangers.
          - button "Tribal Custom & Photography Ethics" [ref=e261] [cursor=pointer]:
            - generic [ref=e262]:
              - img [ref=e264]
              - heading "Tribal Custom & Photography Ethics" [level=3] [ref=e267]
            - img [ref=e268]
          - button "Sound & Light Discipline in Wildlife Zones" [ref=e271] [cursor=pointer]:
            - generic [ref=e272]:
              - img [ref=e274]
              - heading "Sound & Light Discipline in Wildlife Zones" [level=3] [ref=e276]
            - img [ref=e277]
      - button "Voice Accessibility Assistant" [ref=e280] [cursor=pointer]:
        - img [ref=e281]
  - contentinfo [ref=e284]:
    - generic [ref=e285]:
      - generic [ref=e286]:
        - generic [ref=e287]:
          - generic [ref=e288]:
            - generic [ref=e289]: CG
            - generic [ref=e290]: CG Tourism OS
          - paragraph [ref=e291]: Digitizing Chhattisgarh's rich tribal narratives, natural bio-reserves, and heritage corridors. Built with authenticity for responsible digital discovery.
        - generic [ref=e292]:
          - heading "Exploration Hub" [level=4] [ref=e293]
          - list [ref=e294]:
            - listitem [ref=e295]:
              - link "Interactive Travel Map" [ref=e296] [cursor=pointer]:
                - /url: /explore
            - listitem [ref=e297]:
              - link "Scenic Waterfalls" [ref=e298] [cursor=pointer]:
                - /url: /explore?cat=waterfalls
            - listitem [ref=e299]:
              - link "Eco-Forest Reserves" [ref=e300] [cursor=pointer]:
                - /url: /explore?cat=forests
            - listitem [ref=e301]:
              - link "Spiritual Temples" [ref=e302] [cursor=pointer]:
                - /url: /explore?cat=temples
        - generic [ref=e303]:
          - heading "Sovereign Services" [level=4] [ref=e304]
          - list [ref=e305]:
            - listitem [ref=e306]:
              - link "Heuristic AI Itinerary Builder" [ref=e307] [cursor=pointer]:
                - /url: /planner
            - listitem [ref=e308]:
              - link "Tribal Folklore Ingestion" [ref=e309] [cursor=pointer]:
                - /url: /stories
            - listitem [ref=e310]:
              - link "Offline Disaster Protocols" [ref=e311] [cursor=pointer]:
                - /url: /sos
            - listitem [ref=e312]:
              - link "Smart Governance Analytics" [ref=e313] [cursor=pointer]:
                - /url: /admin
        - generic [ref=e314]:
          - heading "State Emergency Support" [level=4] [ref=e315]
          - generic [ref=e316]:
            - generic [ref=e317]: 24/7 HELPLINE ASSISTANCE
            - 'link "Call Emergency: 112" [ref=e318] [cursor=pointer]':
              - /url: tel:112
            - link "Open Offline Emergency Deck →" [ref=e319] [cursor=pointer]:
              - /url: /sos
      - generic [ref=e320]:
        - generic [ref=e321]: © 2026 Chhattisgarh Smart Tourism Board. All Rights Reserved.
        - generic [ref=e322]:
          - generic [ref=e323]: ✔ Low-Carbon Offline-Ready Engine
          - generic [ref=e324]: Version 1.0.0 (MVP)
  - button "Open Next.js Dev Tools" [ref=e330] [cursor=pointer]:
    - img [ref=e331]
  - alert [ref=e334]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Offline Translation Capabilities', () => {
  4  |   test('Loads dynamic translations from cache when offline', async ({ page, context }) => {
  5  |     await page.goto('/');
  6  | 
  7  |     // Seed localStorage with cached dynamic translations
  8  |     await page.evaluate(() => {
  9  |       localStorage.setItem('cg_lang', 'cg');
  10 |       localStorage.setItem('dynamic_translations_cg', JSON.stringify({
  11 |         'place-123': {
  12 |           'description': 'यह एक सुंदर झरना है' // Mocked translated description
  13 |         }
  14 |       }));
  15 |     });
  16 | 
  17 |     // Go offline
  18 |     await context.setOffline(true);
  19 | 
  20 |     // Verify the cached language is maintained without a hard reload
  21 |     // Once PWA Service Worker is added, we can uncomment page.reload()
  22 |     const savedLang = await page.evaluate(() => localStorage.getItem('preferred_language'));
> 23 |     expect(savedLang).toBe('cg');
     |                       ^ Error: expect(received).toBe(expected) // Object.is equality
  24 |   });
  25 | });
  26 | 
```