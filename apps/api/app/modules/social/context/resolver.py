from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

CG_DISTRICTS = {
    "bastar": ["bastar", "jagdalpur", "chitrakote", "teerathgarh", "kanger", "dandami"],
    "dantewada": ["dantewada", "danteshwari", "barsur", "dholkal"],
    "kanker": ["kanker", "charre-marre", "gadiya mountain"],
    "kondagaon": ["kondagaon", "bell metal", "dhokra", "ghadwa"],
    "narayanpur": ["narayanpur", "abhujmarh"],
    "sukma": ["sukma", "doodma", "tunga"],
    "bijapur": ["bijapur", "indravati", "bhairamgarh"],
    "raipur": ["raipur", "champaran", "swami vivekananda sarovar", "purkhouti muktangan"],
    "durg": ["durg", "bhilai", "maitribagh"],
    "rajnandgaon": ["rajnandgaon", "dongargarh", "bamleshwari"],
    "bilaspur": ["bilaspur", "rathanpur", "khutaghat", "malhar"],
    "surguja": ["surguja", "ambikapur", "mainpat", "ulta pani", "tiger point"],
    "korba": ["korba", "chaiturgarh", "hasdeo"],
    "jashpur": ["jashpur", "ranidah", "deshdekha"],
    "kawardha": ["kawardha", "bhoramdeo", "chilfi ghati"],
    "mahasamund": ["mahasamund", "sirpur", "laxman temple", "barnawapara"],
    "dhamtari": ["dhamtari", "gangrel", "sitanadi"],
    "gariaband": ["gariaband", "jatmai", "ghatarani", "bhuteshwar nath"],
    "janigir-champa": ["janjgir", "champa", "sheorinarayan"],
    "raigarh": ["raigarh", "singhanpur", "kabrapahar"],
}

CG_TOURISM_KEYWORDS = {
    "waterfalls": ["waterfall", "falls", "chitrakote", "teerathgarh", "tamda", "amritdhara", "tiger point"],
    "heritage": ["heritage", "temple", "bhoramdeo", "sirpur", "barsur", "danteshwari", "laxman temple", "palace"],
    "wildlife": ["wildlife", "kanger valley", "national park", "barnawapara", "sitanadi", "tiger", "bison", "deer"],
    "tribal-art": ["tribal", "dhokra", "bell metal", "ghadwa", "wood craft", "terracotta", "bastar art"],
    "festivals": ["dussehra", "bastar dussehra", "madai", "chaitrai", "hareli", "pola", "karma"],
    "nature-caves": ["cave", "kutumsar", "kandhar", "dandak", "limestone", "hills", "plateau", "mainpat"],
    "cuisine": ["chila", "fara", "angakar", "bobra", "mahua", "chaprah", "red ant chutney", "dubki"],
}


@dataclass(slots=True)
class ResolvedSocialContext:
    district_id: str | None = None
    tourism_zone_id: str | None = None
    place_id: str | None = None
    place_slug: str | None = None
    tourism_tags: list[str] = field(default_factory=list)
    cultural_tags: list[str] = field(default_factory=list)
    hashtags: list[str] = field(default_factory=list)


class SocialContextResolver:
    """Resolves tourism context (districts, places, tags) from content text and creator defaults."""

    @classmethod
    def resolve_context(
        cls,
        title: str | None,
        description: str | None,
        creator_district_id: str | None = "bastar",
        provided_tags: list[str] | None = None,
    ) -> ResolvedSocialContext:
        full_text = f"{title or ''} {description or ''}".lower()

        # 1. District inference
        resolved_district = creator_district_id.lower() if creator_district_id else "bastar"
        for district, keywords in CG_DISTRICTS.items():
            if any(kw in full_text for kw in keywords):
                resolved_district = district
                break

        # 2. Tourism and cultural tags inference
        tourism_tags: set[str] = set()
        cultural_tags: set[str] = set()

        for category, kws in CG_TOURISM_KEYWORDS.items():
            for kw in kws:
                if kw in full_text:
                    tourism_tags.add(category)
                    if category in ("tribal-art", "festivals"):
                        cultural_tags.add(kw.replace(" ", "-"))

        if provided_tags:
            for tag in provided_tags:
                tag_clean = tag.strip().lstrip("#").lower()
                if tag_clean:
                    tourism_tags.add(tag_clean)

        # 3. Extract hashtags
        hashtags = [
            tag.lower()
            for tag in re.findall(r"#(\w+)", f"{title or ''} {description or ''}")
        ]

        # 4. Infer tourism zone from district
        tourism_zone = "bastar-circuit" if resolved_district in [
            "bastar", "dantewada", "kanker", "kondagaon", "narayanpur", "sukma", "bijapur"
        ] else "central-circuit" if resolved_district in [
            "raipur", "durg", "rajnandgaon", "bilaspur", "dhamtari", "mahasamund", "gariaband", "kawardha"
        ] else "northern-circuit"

        return ResolvedSocialContext(
            district_id=resolved_district,
            tourism_zone_id=tourism_zone,
            tourism_tags=sorted(list(tourism_tags)),
            cultural_tags=sorted(list(cultural_tags)),
            hashtags=hashtags,
        )
