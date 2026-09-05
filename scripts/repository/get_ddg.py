from duckduckgo_search import DDGS
import json

places = [
    "Chitrakote Waterfalls",
    "Sirpur Heritage Complex",
    "Bhoramdeo Temple",
    "Kanger Valley National Park",
    "Tirathgarh Waterfalls",
    "Barnawapara Wildlife Sanctuary",
    "Achanakmar Tiger Reserve",
    "Gangrel Dam"
]

results = {}
with DDGS() as ddgs:
    for p in places:
        res = list(ddgs.images(f"{p} Chhattisgarh high resolution", max_results=1))
        if res:
            results[p] = res[0]['image']

print(json.dumps(results, indent=2))
