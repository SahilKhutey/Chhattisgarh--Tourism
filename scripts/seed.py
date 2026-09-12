"""CG Tourism Platform - Seed Script.

Populates 3 core templates, versions, fields, and 10+ realistic content items
covering districts, multilingual data, geospatial coordinates, and statuses.
"""

import hashlib
import json
import os
import sys
import uuid
from datetime import datetime, timezone

# Ensure apps/api is on the python path
current_dir = os.path.dirname(os.path.abspath(__file__))
api_dir = os.path.join(os.path.dirname(current_dir), "apps", "api")
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

from sqlalchemy import select
from app.core.database import SessionLocal
from app.events.publisher import transactional_publish
from app.jobs.outbox import process_outbox_once
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_template.models.template import ContentTemplate
from app.modules.content_template.models.template_field import TemplateField
from app.modules.content_template.models.template_version import (
    TemplateVersion,
    TemplateVersionField,
)


def compute_hash(data: dict) -> str:
    serialized = json.dumps(data, sort_keys=True)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


TEMPLATES_CONFIG = [
    {
        "name": "Destination",
        "slug": "destination",
        "category": "destinations",
        "description": "Natural, heritage, and cultural destinations in Chhattisgarh",
        "icon": "mountain",
        "fields": [
            {"key": "name", "label": "Destination Name", "type": "text", "order": 1, "required": True, "translatable": True},
            {"key": "description", "label": "Overview Description", "type": "rich_text", "order": 2, "required": True, "translatable": True},
            {"key": "district", "label": "District", "type": "text", "order": 3, "required": True, "translatable": False},
            {"key": "location", "label": "Geographic Coordinates", "type": "geo", "order": 4, "required": False, "translatable": False},
            {"key": "tags", "label": "Tags & Themes", "type": "tags", "order": 5, "required": False, "translatable": False},
            {"key": "hero_image", "label": "Hero Image URL", "type": "image", "order": 6, "required": False, "translatable": False},
        ],
    },
    {
        "name": "Event & Festival",
        "slug": "event",
        "category": "events",
        "description": "Cultural, tribal, and spiritual events and festivals",
        "icon": "calendar",
        "fields": [
            {"key": "name", "label": "Event Name", "type": "text", "order": 1, "required": True, "translatable": True},
            {"key": "description", "label": "Event Description", "type": "rich_text", "order": 2, "required": True, "translatable": True},
            {"key": "district", "label": "District", "type": "text", "order": 3, "required": True, "translatable": False},
            {"key": "start_date", "label": "Start Date", "type": "text", "order": 4, "required": False, "translatable": False},
            {"key": "end_date", "label": "End Date", "type": "text", "order": 5, "required": False, "translatable": False},
            {"key": "tags", "label": "Tags", "type": "tags", "order": 6, "required": False, "translatable": False},
        ],
    },
    {
        "name": "Attraction",
        "slug": "attraction",
        "category": "attractions",
        "description": "Specific monuments, viewpoints, sanctuaries, and cultural centers",
        "icon": "sparkles",
        "fields": [
            {"key": "name", "label": "Attraction Name", "type": "text", "order": 1, "required": True, "translatable": True},
            {"key": "description", "label": "Attraction Details", "type": "rich_text", "order": 2, "required": True, "translatable": True},
            {"key": "district", "label": "District", "type": "text", "order": 3, "required": True, "translatable": False},
            {"key": "category", "label": "Category", "type": "text", "order": 4, "required": False, "translatable": False},
            {"key": "tags", "label": "Tags", "type": "tags", "order": 5, "required": False, "translatable": False},
        ],
    },
]

DESTINATION_ITEMS = [
    {
        "slug": "chitrakote-waterfalls",
        "title": "Chitrakote Waterfalls",
        "district": "Bastar",
        "tags": ["waterfall", "bastar", "nature", "indravati", "niagara-of-india"],
        "lat": 19.2014,
        "lng": 81.7061,
        "name": {
            "en": "Chitrakote Waterfalls",
            "hi": "चित्रकूट जलप्रपात",
            "cg": "चित्रकोट झरना",
        },
        "description": {
            "en": "Known as the Niagara of India, Chitrakote is the widest waterfall in India, plunging dramatically over a horseshoe cliff on the Indravati River in Bastar.",
            "hi": "भारत का नियाग्रा कहे जाने वाला चित्रकूट जलप्रपात बस्तर में इंद्रावती नदी पर स्थित भारत का सबसे चौड़ा जलप्रपात है।",
            "cg": "इंद्रावती नदी म बने चित्रकूट झरना ह पूरा भारत म सबले चौड़ा झरना हे।",
        },
    },
    {
        "slug": "tirathgarh-falls",
        "title": "Tirathgarh Falls",
        "district": "Bastar",
        "tags": ["waterfall", "bastar", "kanger-valley", "nature"],
        "lat": 18.9147,
        "lng": 81.8653,
        "name": {
            "en": "Tirathgarh Falls",
            "hi": "तीरथगढ़ जलप्रपात",
            "cg": "तीरथगढ़ झरना",
        },
        "description": {
            "en": "A magnificent block-type waterfall cascading down multiple steps in the Kanger Ghati National Park near Jagdalpur.",
            "hi": "कांगेर घाटी राष्ट्रीय उद्यान में स्थित तीरथगढ़ जलप्रपात सीढ़ीदार चट्टानों से गिरता एक अत्यंत मनोहारी दृश्य प्रस्तुत करता है।",
            "cg": "कांगेर घाटी म तीरथगढ़ के झरना कई पायदान म गिरथे अऊ बड़ सुग्घर दिखथे।",
        },
    },
    {
        "slug": "kanger-ghati-national-park",
        "title": "Kanger Ghati National Park",
        "district": "Bastar",
        "tags": ["national-park", "wildlife", "bastar", "caves", "biodiversity"],
        "lat": 18.7890,
        "lng": 81.9950,
        "name": {
            "en": "Kanger Ghati National Park",
            "hi": "कांगेर घाटी राष्ट्रीय उद्यान",
            "cg": "कांगेर घाटी राष्ट्रीय उद्यान",
        },
        "description": {
            "en": "Home to the state bird Bastar Hill Myna, subterranean limestone caves like Kutumsar, and dense sal forests.",
            "hi": "राज्य पक्षी पहाड़ी मैना का घर, कुटुमसर जैसी चूना पत्थर की गुफाएं और सघन साल वनों से समृद्ध राष्ट्रीय उद्यान।",
            "cg": "पहाड़ी मैना के घर, कुटुमसर गुफा अऊ घना जंगल ले भरे कांगेर घाटी।",
        },
    },
    {
        "slug": "danteshwari-temple",
        "title": "Danteshwari Temple Dantewada",
        "district": "Dantewada",
        "tags": ["temple", "spiritual", "heritage", "shakti-peeth", "dantewada"],
        "lat": 18.8950,
        "lng": 81.3500,
        "name": {
            "en": "Maa Danteshwari Temple",
            "hi": "मां दंतेश्वरी मंदिर",
            "cg": "दाई दंतेश्वरी मंदिर",
        },
        "description": {
            "en": "One of the 52 sacred Shakti Peethas, located at the sacred confluence of Shankini and Dankini rivers in Dantewada.",
            "hi": "शंकिनी और डंकिनी नदियों के पावन संगम पर स्थित 52 शक्तिपीठों में से एक अत्यंत प्रतिष्ठित मंदिर।",
            "cg": "शंकिनी-डंकिनी नदिया के संगम म मां दंतेश्वरी के पवित्र शक्तिपीठ।",
        },
    },
    {
        "slug": "sirpur-heritage-site",
        "title": "Sirpur Historical Heritage Complex",
        "district": "Mahasamund",
        "tags": ["heritage", "archaeology", "buddhist", "temple", "mahasamund"],
        "lat": 21.3414,
        "lng": 82.1797,
        "name": {
            "en": "Sirpur Heritage Complex",
            "hi": "सिरपुर ऐतिहासिक धरोहर",
            "cg": "सिरपुर धरोहर",
        },
        "description": {
            "en": "Ancient city on the banks of Mahanadi, featuring the 7th-century brick Lakshmana Temple and monumental Buddhist viharas.",
            "hi": "महानदी तट पर स्थित प्राचीन ऐतिहासिक नगरी, 7वीं शताब्दी का ईंटों से निर्मित लक्ष्मण मंदिर एवं विशाल बौद्ध विहार।",
            "cg": "महानदी तीर म बसे सिरपुर म ईंटा के लक्ष्मण मंदिर अऊ बौद्ध विहार हे।",
        },
    },
    {
        "slug": "barnawapara-wildlife-sanctuary",
        "title": "Barnawapara Wildlife Sanctuary",
        "district": "Baloda Bazar",
        "tags": ["wildlife", "safari", "forest", "baloda-bazar", "nature"],
        "lat": 21.4000,
        "lng": 82.4167,
        "name": {
            "en": "Barnawapara Wildlife Sanctuary",
            "hi": "बारनवापारा वन्यजीव अभयारण्य",
            "cg": "बारनवापारा अभयारण्य",
        },
        "description": {
            "en": "A lush sanctuary famous for leopards, Indian bison (gaur), barking deer, and diverse bird species in flat and undulating terrain.",
            "hi": "तेंदुओं, भारतीय गौर (बाइसन) और विविध पक्षियों के लिए प्रसिद्ध मनोहारी अभयारण्य।",
            "cg": "गौर, चीता अऊ चिरई-चुरुंग ले भरा बारनवापारा के घना जंगल।",
        },
    },
    {
        "slug": "mainpat-hill-station",
        "title": "Mainpat — Shimla of Chhattisgarh",
        "district": "Surguja",
        "tags": ["hill-station", "tibetan", "surguja", "bouncing-land", "waterfall"],
        "lat": 22.8167,
        "lng": 83.2833,
        "name": {
            "en": "Mainpat Hill Station",
            "hi": "मैनपाट हिल स्टेशन",
            "cg": "मैनपाट हिल स्टेशन",
        },
        "description": {
            "en": "Known as the Shimla of Chhattisgarh, Mainpat is home to Tibetan settlements, monasteries, bouncing land (Jaljali), and Tiger Point.",
            "hi": "छत्तीसगढ़ का शिमला कहा जाने वाला मैनपाट, तिब्बती संस्कृति, मठ, जलजली और टाइगर पॉइंट के लिए प्रसिद्ध है।",
            "cg": "छत्तीसगढ़ के शिमला मैनपाट, जिहां जलजली जमीन अऊ तिब्बती मंदिर हे।",
        },
    },
    {
        "slug": "bhoramdeo-temple",
        "title": "Bhoramdeo Temple Complex",
        "district": "Kabirdham",
        "tags": ["temple", "heritage", "khajuraho-of-cg", "kabirdham", "sculpture"],
        "lat": 22.1189,
        "lng": 81.1606,
        "name": {
            "en": "Bhoramdeo Temple",
            "hi": "भोरमदेव मंदिर",
            "cg": "भोरमदेव मंदिर",
        },
        "description": {
            "en": "Often referred to as the Khajuraho of Chhattisgarh, an 11th-century Nagara-style stone temple dedicated to Lord Shiva in the Maikal range.",
            "hi": "छत्तीसगढ़ का खजुराहो, मैकल पर्वत श्रृंखला की तलहटी में 11वीं सदी का नागर शैली में बना शिव मंदिर।",
            "cg": "मैकल पहाड़ तीर 11वीं सदी के सुग्घर पाथर वाला भोरमदेव मंदिर।",
        },
    },
    {
        "slug": "madku-dweep",
        "title": "Madku Dweep River Island",
        "district": "Bilaspur",
        "tags": ["island", "heritage", "shivnath", "bilaspur", "spirituality"],
        "lat": 21.9000,
        "lng": 81.8000,
        "name": {
            "en": "Madku Dweep",
            "hi": "मदकू द्वीप",
            "cg": "मदकू टापू",
        },
        "description": {
            "en": "A tranquil island formed by the Shivnath River, known for ancient excavated temples, meditation sites, and annual fairs.",
            "hi": "शिवनाथ नदी द्वारा निर्मित शांत द्वीप, प्राचीन पुरातात्विक मंदिरों और ध्यान स्थलों के लिए विख्यात।",
            "cg": "शिवनाथ नदी म बसे मदकू द्वीप जिहां प्राचीन मंदिर अऊ मेला भरथे।",
        },
    },
    {
        "slug": "champaran-spiritual-center",
        "title": "Champaran Mahaprabhu Vallabhacharya Birthplace",
        "district": "Raipur",
        "tags": ["spiritual", "raipur", "heritage", "pilgrimage"],
        "lat": 21.0500,
        "lng": 81.9333,
        "name": {
            "en": "Champaran Spiritual Center",
            "hi": "चम्पारण तीर्थ स्थल",
            "cg": "चम्पारण धाम",
        },
        "description": {
            "en": "Sacred birthplace of Mahaprabhu Vallabhacharya, the pioneer of the Pushtimarg sect, attracting pilgrims nationwide.",
            "hi": "पुष्टिमार्ग के प्रवर्तक महाप्रभु वल्लभाचार्य का पावन जन्मस्थान और प्रमुख वैष्णव तीर्थ।",
            "cg": "महाप्रभु वल्लभाचार्य जी के पावन जनम भुइयां चम्पारण तीर्थ।",
        },
    },
]

EVENT_ITEMS = [
    {
        "slug": "bastar-dussehra",
        "title": "Bastar Dussehra",
        "district": "Bastar",
        "tags": ["festival", "bastar", "tribal-culture", "heritage", "rath-yatra"],
        "name": {
            "en": "Bastar Dussehra — 75-Day Tribal Festival",
            "hi": "बस्तर दशहरा — 75 दिवसीय जनजातीय महापर्व",
            "cg": "बस्तर दशहरा — 75 दिन के जनजातीय परब",
        },
        "description": {
            "en": "The world's longest festival lasting 75 days, celebrating tribal unity and devotion to Goddess Danteshwari rather than Rama's victory.",
            "hi": "75 दिनों तक चलने वाला विश्व का सबसे लंबा उत्सव, जो देवी दंतेश्वरी और बस्तर के जनजातीय सद्भाव को समर्पित है।",
            "cg": "दुनिया म सबले लंबा 75 दिन चले वाला बस्तर दशहरा परब।",
        },
    },
    {
        "slug": "rajim-kumbh-mela",
        "title": "Rajim Kumbh Kalp Mela",
        "district": "Gariaband",
        "tags": ["festival", "kumbh", "triveni-sangam", "pilgrimage", "gariaband"],
        "name": {
            "en": "Rajim Kumbh Mela",
            "hi": "राजिम कुंभ कल्प मेला",
            "cg": "राजिम कुंभ मेला",
        },
        "description": {
            "en": "Celebrated at the Triveni Sangam of Mahanadi, Pairi, and Sondhur rivers, drawing sadhus and devotees from across India on Magh Purnima.",
            "hi": "महानदी, पैरी और सोंढूर नदियों के त्रिवेणी संगम पर माघ पूर्णिमा से महाशिवरात्रि तक आयोजित भव्य मेला।",
            "cg": "महानदी, पैरी अऊ सोंढूर के त्रिवेणी संगम म राजिम कुंभ के पावन मेला।",
        },
    },
]

DRAFT_ITEMS = [
    {
        "slug": "ramaram-sukma-heritage",
        "title": "Ramaram Sukma Heritage Site (Draft)",
        "district": "Sukma",
        "tags": ["heritage", "ramayana", "sukma", "draft"],
        "status": "DRAFT",
        "name": {"en": "Ramaram Sukma Heritage Site"},
        "description": {"en": "Ancient Ramayana circuit site located in Sukma district (Draft in progress)."},
    },
    {
        "slug": "tatapani-hot-springs",
        "title": "Tatapani Geothermal Springs (Draft)",
        "district": "Balrampur",
        "tags": ["hot-springs", "nature", "balrampur", "draft"],
        "status": "DRAFT",
        "name": {"en": "Tatapani Geothermal Springs"},
        "description": {"en": "Natural hot sulphur springs located in Balrampur district (Draft)."},
    },
]

IN_REVIEW_ITEMS = [
    {
        "slug": "malanjhkudum-falls",
        "title": "Malanjhkudum Waterfalls (Review)",
        "district": "Kanker",
        "tags": ["waterfall", "kanker", "nature", "review"],
        "status": "IN_REVIEW",
        "name": {"en": "Malanjhkudum Waterfalls"},
        "description": {"en": "Step waterfall on the Doodh river near Kanker awaiting editorial sign-off."},
    },
    {
        "slug": "guru-ghasidas-national-park",
        "title": "Guru Ghasidas Tiger Reserve (Review)",
        "district": "Koriya",
        "tags": ["tiger-reserve", "wildlife", "koriya", "review"],
        "status": "IN_REVIEW",
        "name": {"en": "Guru Ghasidas Tiger Reserve"},
        "description": {"en": "Expansive biodiversity and tiger reserve corridor undergoing moderation review."},
    },
]


def run_seed():
    print("Starting CG Tourism Database Seed...")
    db = SessionLocal()
    try:
        created_templates = {}

        # 1. Seed Templates, Versions, and Fields
        for t_cfg in TEMPLATES_CONFIG:
            tpl = db.scalar(select(ContentTemplate).where(ContentTemplate.slug == t_cfg["slug"]))
            if not tpl:
                tpl = ContentTemplate(
                    name=t_cfg["name"],
                    slug=t_cfg["slug"],
                    description=t_cfg["description"],
                    icon=t_cfg["icon"],
                    category=t_cfg["category"],
                    status="PUBLISHED",
                )
                db.add(tpl)
                db.flush()
                print(f"Created template: {tpl.name} ({tpl.slug})")

            # Check or create version 1
            ver = db.scalar(
                select(TemplateVersion).where(
                    TemplateVersion.template_id == tpl.id,
                    TemplateVersion.version_number == 1,
                )
            )
            if not ver:
                schema_data = {
                    "template": tpl.slug,
                    "fields": [f["key"] for f in t_cfg["fields"]],
                }
                ver = TemplateVersion(
                    template_id=tpl.id,
                    version_number=1,
                    name=f"{tpl.name} v1",
                    slug=f"{tpl.slug}-v1",
                    description=f"Initial published schema for {tpl.name}",
                    icon=tpl.icon,
                    category=tpl.category,
                    schema_hash=compute_hash(schema_data),
                    breaking_change=False,
                    risk_summary={"changes": ["Initial release"]},
                    created_by="system-seed",
                )
                db.add(ver)
                db.flush()

                # Add version fields
                for f_cfg in t_cfg["fields"]:
                    v_field = TemplateVersionField(
                        version_id=ver.id,
                        key=f_cfg["key"],
                        label=f_cfg["label"],
                        type=f_cfg["type"],
                        required=f_cfg["required"],
                        translatable=f_cfg["translatable"],
                        order=f_cfg["order"],
                        group="General",
                        config={},
                    )
                    db.add(v_field)

                tpl.published_version_id = ver.id
                db.flush()
                print(f"Created version 1 for template: {tpl.slug}")

            created_templates[tpl.slug] = (tpl, ver)

        db.commit()

        dest_tpl, dest_ver = created_templates["destination"]
        event_tpl, event_ver = created_templates["event"]

        # 2. Seed Published Destinations
        for item in DESTINATION_ITEMS:
            existing = db.scalar(
                select(ContentEntry).where(
                    ContentEntry.template_id == dest_tpl.id,
                    ContentEntry.slug == item["slug"],
                )
            )
            values = {
                "name": item["name"],
                "description": item["description"],
                "district": item["district"],
                "location": {"lat": item["lat"], "lng": item["lng"]},
                "tags": item["tags"],
                "hero_image": f"https://images.unsplash.com/photo-cg-{item['slug']}?auto=format&fit=crop&w=1600",
            }
            locale_values = {
                "en": {"name": item["name"]["en"], "description": item["description"]["en"]},
                "hi": {"name": item["name"]["hi"], "description": item["description"]["hi"]},
                "cg": {"name": item["name"]["cg"], "description": item["description"]["cg"]},
            }

            if not existing:
                entry = ContentEntry(
                    template_id=dest_tpl.id,
                    template_version_id=dest_ver.id,
                    slug=item["slug"],
                    title=item["title"],
                    status="DRAFT",
                    values=values,
                    locale_values=locale_values,
                    created_by="seed-admin",
                    updated_by="seed-admin",
                )
                db.add(entry)
                db.commit()
                # Publish transactionally
                transactional_publish(db, entry.id, "seed-admin")
                print(f"Published destination: {entry.title} ({entry.slug})")

        # 3. Seed Published Events
        for item in EVENT_ITEMS:
            existing = db.scalar(
                select(ContentEntry).where(
                    ContentEntry.template_id == event_tpl.id,
                    ContentEntry.slug == item["slug"],
                )
            )
            values = {
                "name": item["name"],
                "description": item["description"],
                "district": item["district"],
                "tags": item["tags"],
                "start_date": "2026-10-01",
                "end_date": "2026-10-15",
            }
            locale_values = {
                "en": {"name": item["name"]["en"], "description": item["description"]["en"]},
                "hi": {"name": item["name"]["hi"], "description": item["description"]["hi"]},
                "cg": {"name": item["name"]["cg"], "description": item["description"]["cg"]},
            }

            if not existing:
                entry = ContentEntry(
                    template_id=event_tpl.id,
                    template_version_id=event_ver.id,
                    slug=item["slug"],
                    title=item["title"],
                    status="DRAFT",
                    values=values,
                    locale_values=locale_values,
                    created_by="seed-admin",
                    updated_by="seed-admin",
                )
                db.add(entry)
                db.commit()
                transactional_publish(db, entry.id, "seed-admin")
                print(f"Published event: {entry.title} ({entry.slug})")

        # 4. Seed Draft Items
        for item in DRAFT_ITEMS:
            existing = db.scalar(
                select(ContentEntry).where(
                    ContentEntry.template_id == dest_tpl.id,
                    ContentEntry.slug == item["slug"],
                )
            )
            if not existing:
                entry = ContentEntry(
                    template_id=dest_tpl.id,
                    template_version_id=dest_ver.id,
                    slug=item["slug"],
                    title=item["title"],
                    status="DRAFT",
                    values={
                        "name": item["name"],
                        "description": item["description"],
                        "district": item["district"],
                        "tags": item["tags"],
                    },
                    locale_values={"en": {"name": item["name"]["en"], "description": item["description"]["en"]}},
                    created_by="seed-creator",
                    updated_by="seed-creator",
                )
                db.add(entry)
                db.commit()
                print(f"Created draft: {entry.title} ({entry.slug})")

        # 5. Seed In-Review Items
        for item in IN_REVIEW_ITEMS:
            existing = db.scalar(
                select(ContentEntry).where(
                    ContentEntry.template_id == dest_tpl.id,
                    ContentEntry.slug == item["slug"],
                )
            )
            if not existing:
                entry = ContentEntry(
                    template_id=dest_tpl.id,
                    template_version_id=dest_ver.id,
                    slug=item["slug"],
                    title=item["title"],
                    status="IN_REVIEW",
                    values={
                        "name": item["name"],
                        "description": item["description"],
                        "district": item["district"],
                        "tags": item["tags"],
                    },
                    locale_values={"en": {"name": item["name"]["en"], "description": item["description"]["en"]}},
                    created_by="seed-creator",
                    updated_by="seed-creator",
                )
                db.add(entry)
                db.commit()
                print(f"Created in-review item: {entry.title} ({entry.slug})")

        # 6. Process outbox events
        print("Processing Outbox Events for Search & Embedding sync...")
        processed = process_outbox_once(db)
        print(f"Successfully processed {processed} outbox event(s).")

        print("CG Tourism Database Seed COMPLETED SUCCESSFULLY!")

    except Exception as exc:
        db.rollback()
        print(f"Error seeding database: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
