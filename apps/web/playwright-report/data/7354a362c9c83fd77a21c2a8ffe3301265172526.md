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
      - generic [ref=e9]:
        - button "👁️" [ref=e10] [cursor=pointer]:
          - generic [ref=e11]: 👁️
        - button "Toggle mobile menu" [ref=e12]:
          - img [ref=e13]
  - main [ref=e14]:
    - generic [ref=e15]:
      - generic [ref=e16]:
        - img "Misty Chitrakote Horseshoe Gorge" [ref=e18]
        - img "Dense Sal Forest of Bastar" [ref=e21]
        - img "Ancient Sirpur Brick Temples" [ref=e24]
        - generic [ref=e27]:
          - generic [ref=e28]:
            - img [ref=e29]
            - text: Chhattisgarh Sustainable Travel Portal
          - heading "Discover the Real & Authentic" [level=1] [ref=e34]
          - paragraph [ref=e35]: Experience the majestic power of Indravati River's flow.
          - generic [ref=e36]:
            - link "Explore Interactive Map" [ref=e37] [cursor=pointer]:
              - /url: /explore
              - img [ref=e38]
              - text: Explore Interactive Map
            - link "Join Verified Creators" [ref=e40] [cursor=pointer]:
              - /url: /creator
              - img [ref=e41]
              - text: Join Verified Creators
        - generic [ref=e45]:
          - button [ref=e46]
          - button [ref=e47]
          - button [ref=e48]
      - generic [ref=e49]:
        - generic [ref=e50]:
          - generic [ref=e51]: Discovery Gateways
          - heading "Explore Core Experiences" [level=2] [ref=e52]
          - paragraph [ref=e53]: Filter deep through specialized regional layers curated to uncover raw tribal art, sacred waterfalls, and historical routes.
        - generic [ref=e54]:
          - link "🌊 Waterfalls Monsoon cascades" [ref=e55] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e56]: 🌊
            - heading "Waterfalls" [level=4] [ref=e57]
            - generic [ref=e58]: Monsoon cascades
          - link "🌳 Dense Forests Sal canopy trails" [ref=e59] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e60]: 🌳
            - heading "Dense Forests" [level=4] [ref=e61]
            - generic [ref=e62]: Sal canopy trails
          - link "🏛️ Temples & Archeology Ancient ruins" [ref=e63] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e64]: 🏛️
            - heading "Temples & Archeology" [level=4] [ref=e65]
            - generic [ref=e66]: Ancient ruins
          - link "🧗 Adventure Trails Caves & gorges" [ref=e67] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e68]: 🧗
            - heading "Adventure Trails" [level=4] [ref=e69]
            - generic [ref=e70]: Caves & gorges
          - link "🍲 Tribal Gastronomy Indigenous Mahua & Roti" [ref=e71] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e72]: 🍲
            - heading "Tribal Gastronomy" [level=4] [ref=e73]
            - generic [ref=e74]: Indigenous Mahua & Roti
          - link "💎 Hidden Gems Secret pristine valleys" [ref=e75] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e76]: 💎
            - heading "Hidden Gems" [level=4] [ref=e77]
            - generic [ref=e78]: Secret pristine valleys
          - link "👺 Tribal Arts Dhokra & Bell Metal" [ref=e79] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e80]: 👺
            - heading "Tribal Arts" [level=4] [ref=e81]
            - generic [ref=e82]: Dhokra & Bell Metal
          - link "🐯 Wildlife Reserves Tiger & bison domains" [ref=e83] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e84]: 🐯
            - heading "Wildlife Reserves" [level=4] [ref=e85]
            - generic [ref=e86]: Tiger & bison domains
          - link "📸 Photography Spots Unseen panoramic vistas" [ref=e87] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e88]: 📸
            - heading "Photography Spots" [level=4] [ref=e89]
            - generic [ref=e90]: Unseen panoramic vistas
          - link "🌱 Eco Tourism Community homestays" [ref=e91] [cursor=pointer]:
            - /url: /explore?layer=tourism
            - generic [ref=e92]: 🌱
            - heading "Eco Tourism" [level=4] [ref=e93]
            - generic [ref=e94]: Community homestays
      - generic [ref=e96]:
        - generic [ref=e97]:
          - generic [ref=e98]: Smart Telemetry Hub
          - heading "Find Nearby Unexplored Corridors" [level=2] [ref=e99]
          - paragraph [ref=e100]: Enable your location sensor to calculate distance parameters to surrounding waterfalls, sanctuaries, and guides in real-time. All coordinates are handled locally for offline resilience.
          - generic [ref=e101]:
            - button "Activate Location" [ref=e102] [cursor=pointer]:
              - img [ref=e103]
              - text: Activate Location
            - generic [ref=e106]:
              - text: "Status:"
              - strong [ref=e107]: Enable location to calculate distances to Sirpur, Chitrakote, or Kutumsar caves.
        - generic [ref=e109]:
          - img [ref=e110]
          - generic [ref=e113]: Telemetry deactivated
          - generic [ref=e114]: Enable location to calculate distances to Sirpur, Chitrakote, or Kutumsar caves.
      - generic [ref=e115]:
        - generic [ref=e116]:
          - generic [ref=e117]: Intelligent Travel Tides
          - heading "Seasonal Escapes & Routes" [level=2] [ref=e118]
          - paragraph [ref=e119]: Chhattisgarh changes character dramatically with the sun and rain. Tap below to navigate based on seasonal road access and weather safety parameters.
        - generic [ref=e120]:
          - generic [ref=e121]:
            - generic [ref=e122]:
              - img [ref=e124]
              - heading "Monsoon (July - Oct)" [level=3] [ref=e126]
            - heading "Waterfalls Expedition" [level=4] [ref=e127]
            - paragraph [ref=e128]: Chitrakote and Tirathgarh roar with unmatched volume. The forest is absolute vibrant green.
            - generic [ref=e129]:
              - generic [ref=e130]: Top Monitored Nodes
              - generic [ref=e131]:
                - generic [ref=e132]: Chitrakote Waterfalls
                - generic [ref=e133]: Tirathgarh Waterfalls
          - generic [ref=e134]:
            - generic [ref=e135]:
              - img [ref=e137]
              - heading "Winter (Nov - Feb)" [level=3] [ref=e143]
            - heading "Wildlife & Heritage Trails" [level=4] [ref=e144]
            - paragraph [ref=e145]: Perfect cool climate to discover archaeological relics at Sirpur and spot dynamic bison herds in reserve corridors.
            - generic [ref=e146]:
              - generic [ref=e147]: Top Monitored Nodes
              - generic [ref=e148]:
                - generic [ref=e149]: Sirpur Heritage Complex
                - generic [ref=e150]: Kanger Valley National Park
          - generic [ref=e151]:
            - generic [ref=e152]:
              - img [ref=e154]
              - heading "Summer (March - June)" [level=3] [ref=e156]
            - heading "Cool Forest Canopies & Caves" [level=4] [ref=e157]
            - paragraph [ref=e158]: Escape the heat inside deep subterranean Kutumsar limestone caves, maintaining standard cool temperatures year-round.
            - generic [ref=e159]:
              - generic [ref=e160]: Top Monitored Nodes
              - generic [ref=e161]:
                - generic [ref=e162]: Kanger Valley National Park
                - generic [ref=e163]: Bhoramdeo Temple
      - generic [ref=e164]:
        - generic [ref=e165]:
          - generic [ref=e166]:
            - generic [ref=e167]: Signature Travel Hubs
            - heading "Immersive Destination Chronicles" [level=2] [ref=e168]
          - link "Explore interactive maps" [ref=e169] [cursor=pointer]:
            - /url: /explore
            - text: Explore interactive maps
            - img [ref=e170]
        - generic [ref=e172]:
          - generic [ref=e173]:
            - generic [ref=e174]:
              - img "Chitrakote Waterfalls" [ref=e175]
              - generic [ref=e176]: Waterfalls
              - generic [ref=e178]:
                - generic [ref=e179]: ★ 4.9 Rating
                - heading "Chitrakote Waterfalls" [level=3] [ref=e180]
            - generic [ref=e181]:
              - paragraph [ref=e182]: "\"The Majestic 'Niagara of India'\""
              - paragraph [ref=e183]: According to ancient Bastar folk belief, the Indravati river is a mother goddess descending from the heavens. Chitrakote is where she showcases her supreme cosmic energy (Shakti). Local tribal elders narrate that during the monsoon, the heavy roar of the waterfall represents the celestial drums of Lord Shiva. The mist rising from the gorge is believed to carry the prayers of the forest spirits directly to the heavens.
              - generic [ref=e184]:
                - generic [ref=e185]: "BIODIVERSITY: 92%"
                - link "View Story Details" [ref=e186] [cursor=pointer]:
                  - /url: /destination/chitrakote-falls
                  - text: View Story Details
                  - img [ref=e187]
          - generic [ref=e190]:
            - generic [ref=e191]:
              - img "Sirpur Heritage Complex" [ref=e192]
              - generic [ref=e193]: Temples & Archeology
              - generic [ref=e195]:
                - generic [ref=e196]: ★ 4.8 Rating
                - heading "Sirpur Heritage Complex" [level=3] [ref=e197]
            - generic [ref=e198]:
              - paragraph [ref=e199]: "\"Ancient Crimson Brickwork & Lost Dynasties\""
              - paragraph [ref=e200]: Sirpur, historically known as Shripura, was the ancient capital of Panduvansh kings in the 6th century. The centerpiece, Laxman Temple, stands as one of the finest surviving brick temples in India. Constructed with intricately carved red clay bricks, it was funded by Queen Vasata in memory of her late husband. Archaeological excavations reveal that Sirpur was a major international center for Buddhist, Hindu, and Jain learning, outdating even the famous Nalanda University.
              - generic [ref=e201]:
                - generic [ref=e202]: "BIODIVERSITY: 78%"
                - link "View Story Details" [ref=e203] [cursor=pointer]:
                  - /url: /destination/sirpur-monuments
                  - text: View Story Details
                  - img [ref=e204]
          - generic [ref=e207]:
            - generic [ref=e208]:
              - img "Bhoramdeo Temple" [ref=e209]
              - generic [ref=e210]: Temples & Archeology
              - generic [ref=e212]:
                - generic [ref=e213]: ★ 4.7 Rating
                - heading "Bhoramdeo Temple" [level=3] [ref=e214]
            - generic [ref=e215]:
              - paragraph [ref=e216]: "\"The 'Khajuraho of Chhattisgarh'\""
              - paragraph [ref=e217]: Nestled in the lush Maikal Hills, Bhoramdeo was built by King Ramachandra of the Phani Nagvanshi dynasty in the 11th century. Dedicated to Lord Shiva, its design blends Nagara temple style with local tribal Gond symbolism. The temple walls are carved with incredible depictions of mythological deities, warriors, mythical beasts, and sensual carvings. It gets its name from 'Bhoramdeo', an ancient tribal deity of the Gond community who is worshipped here alongside Shiva.
              - generic [ref=e218]:
                - generic [ref=e219]: "BIODIVERSITY: 88%"
                - link "View Story Details" [ref=e220] [cursor=pointer]:
                  - /url: /destination/bhoramdeo-temple
                  - text: View Story Details
                  - img [ref=e221]
      - generic [ref=e224]:
        - generic [ref=e225]:
          - generic [ref=e226]: Ecological Protocol
          - heading "Responsible Traveler Directives" [level=2] [ref=e227]
          - paragraph [ref=e228]: As a community-powered space, we respect local customs, protect deep Sal sanctuaries, and strictly enforce visual carrying limits.
        - generic [ref=e229]:
          - generic [ref=e230]:
            - button "Eco Awareness & Carrying Capacity" [ref=e231] [cursor=pointer]:
              - generic [ref=e232]:
                - img [ref=e234]
                - heading "Eco Awareness & Carrying Capacity" [level=3] [ref=e237]
              - img [ref=e238]
            - generic [ref=e240]: Our forest trails operate under strict ecological load regulations. When visiting reserves like Kanger Valley, limit plastics, pack out waste, and abide by group sizes set by forestry rangers.
          - button "Tribal Custom & Photography Ethics" [ref=e242] [cursor=pointer]:
            - generic [ref=e243]:
              - img [ref=e245]
              - heading "Tribal Custom & Photography Ethics" [level=3] [ref=e248]
            - img [ref=e249]
          - button "Sound & Light Discipline in Wildlife Zones" [ref=e252] [cursor=pointer]:
            - generic [ref=e253]:
              - img [ref=e255]
              - heading "Sound & Light Discipline in Wildlife Zones" [level=3] [ref=e257]
            - img [ref=e258]
      - button "Voice Accessibility Assistant" [ref=e261] [cursor=pointer]:
        - img [ref=e262]
  - contentinfo [ref=e265]:
    - generic [ref=e266]:
      - generic [ref=e267]:
        - generic [ref=e268]:
          - generic [ref=e269]:
            - generic [ref=e270]: CG
            - generic [ref=e271]: CG Tourism OS
          - paragraph [ref=e272]: Digitizing Chhattisgarh's rich tribal narratives, natural bio-reserves, and heritage corridors. Built with authenticity for responsible digital discovery.
        - generic [ref=e273]:
          - heading "Exploration Hub" [level=4] [ref=e274]
          - list [ref=e275]:
            - listitem [ref=e276]:
              - link "Interactive Travel Map" [ref=e277] [cursor=pointer]:
                - /url: /explore
            - listitem [ref=e278]:
              - link "Scenic Waterfalls" [ref=e279] [cursor=pointer]:
                - /url: /explore?cat=waterfalls
            - listitem [ref=e280]:
              - link "Eco-Forest Reserves" [ref=e281] [cursor=pointer]:
                - /url: /explore?cat=forests
            - listitem [ref=e282]:
              - link "Spiritual Temples" [ref=e283] [cursor=pointer]:
                - /url: /explore?cat=temples
        - generic [ref=e284]:
          - heading "Sovereign Services" [level=4] [ref=e285]
          - list [ref=e286]:
            - listitem [ref=e287]:
              - link "Heuristic AI Itinerary Builder" [ref=e288] [cursor=pointer]:
                - /url: /planner
            - listitem [ref=e289]:
              - link "Tribal Folklore Ingestion" [ref=e290] [cursor=pointer]:
                - /url: /stories
            - listitem [ref=e291]:
              - link "Offline Disaster Protocols" [ref=e292] [cursor=pointer]:
                - /url: /sos
            - listitem [ref=e293]:
              - link "Smart Governance Analytics" [ref=e294] [cursor=pointer]:
                - /url: /admin
        - generic [ref=e295]:
          - heading "State Emergency Support" [level=4] [ref=e296]
          - generic [ref=e297]:
            - generic [ref=e298]: 24/7 HELPLINE ASSISTANCE
            - 'link "Call Emergency: 112" [ref=e299] [cursor=pointer]':
              - /url: tel:112
            - link "Open Offline Emergency Deck →" [ref=e300] [cursor=pointer]:
              - /url: /sos
      - generic [ref=e301]:
        - generic [ref=e302]: © 2026 Chhattisgarh Smart Tourism Board. All Rights Reserved.
        - generic [ref=e303]:
          - generic [ref=e304]: ✔ Low-Carbon Offline-Ready Engine
          - generic [ref=e305]: Version 1.0.0 (MVP)
  - button "Open Next.js Dev Tools" [ref=e311] [cursor=pointer]:
    - img [ref=e312]
  - alert [ref=e315]
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