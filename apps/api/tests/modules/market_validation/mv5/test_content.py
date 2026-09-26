from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient


def test_content_entry_reference(client: TestClient, researcher_headers: dict):
    payload = {
        "content_id": "CONT_CHITRAKOTE_001",
        "content_type": "DESTINATION",
        "title": "Chitrakote Falls - Niagara of India",
        "category": "WATERFALL",
        "destination_id": "DEST_CHITRAKOTE",
        "short_description": "India's widest natural waterfall located on the Indravati river.",
        "long_description": "Chitrakote Falls is a natural waterfall located to the west of Jagdalpur, in Bastar district.",
        "language": "en",
        "fields_json": {
            "geography": {
                "district": "Bastar",
                "latitude": 19.2017,
                "longitude": 81.7061,
                "nearby_places": ["DEST_TIRATHGARH", "DEST_KANGER_CAVE"],
                "routes": ["NH30 Corridor"],
            },
            "practical": {
                "opening_hours": "06:00 - 18:30",
                "fees": "Free entry; boating ₹100",
                "best_time": "July to October",
                "duration": "3-4 hours",
                "parking": "Ample parking available",
            },
            "cultural": {
                "history": "Ancient river crossing documented in local folklore.",
                "local_story": "Indravati sacred river myths preserved by Gond elders.",
                "community_context": "Tribal boating cooperative operating eco-tours.",
            },
            "trust": {
                "official_reference": "Chhattisgarh Tourism Board verified 2026",
            },
        },
        "governance_status": "CONTENT_VERIFIED",
    }
    resp = client.post("/api/v1/market-validation/content/entries", json=payload, headers=researcher_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["content_id"] == "CONT_CHITRAKOTE_001"
    assert data["quality_score"] > 80.0
    assert data["quality_breakdown"]["completeness"] == 20.0
    assert data["quality_breakdown"]["geographic_context"] == 20.0
    assert data["quality_breakdown"]["practical_utility"] == 20.0


def test_content_quality_score(client: TestClient, researcher_headers: dict):
    # Minimal entry has low quality score
    payload_low = {
        "content_id": "CONT_MINIMAL_001",
        "content_type": "PLACE",
        "title": "Unknown Pond",
        "category": "NATURE",
        "short_description": "A small pond.",
        "governance_status": "CONTENT_DRAFT",
    }
    resp_low = client.post("/api/v1/market-validation/content/entries", json=payload_low, headers=researcher_headers)
    assert resp_low.status_code == 201
    low_data = resp_low.json()
    assert low_data["quality_score"] < 40.0


def test_content_freshness(client: TestClient, researcher_headers: dict):
    # Past review date triggers stale evaluation on update
    now = datetime.now(timezone.utc)
    payload = {
        "content_id": "CONT_FRESHNESS_TEST",
        "content_type": "EXPERIENCE",
        "title": "Dhokra Craft Workshop",
        "category": "CRAFT",
        "short_description": "Traditional lost-wax bell metal casting experience.",
        "governance_status": "CONTENT_VERIFIED",
        "last_verified_at": (now - timedelta(days=120)).isoformat(),
        "next_review_at": (now - timedelta(days=10)).isoformat(),  # Stale!
    }
    resp = client.post("/api/v1/market-validation/content/entries", json=payload, headers=researcher_headers)
    assert resp.status_code == 201
    entry_id = resp.json()["id"]

    # Trigger patch to run freshness check
    patch_resp = client.patch(
        f"/api/v1/market-validation/content/entries/{entry_id}",
        json={"title": "Dhokra Craft Masterclass in Kondagaon"},
        headers=researcher_headers,
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["governance_status"] == "CONTENT_STALE"


def test_content_localization(client: TestClient, researcher_headers: dict):
    payload = {
        "content_id": "CONT_LOCALIZED_001",
        "content_type": "CULTURAL_STORY",
        "title": "Bastar Dussehra 75-Day Festival",
        "category": "FESTIVAL",
        "short_description": "World's longest festival dedicated to Goddess Danteshwari.",
        "language": "hi",
        "fields_json": {
            "localization": {
                "hi": "बस्तर दशहरा 75 दिनों का विश्व प्रसिद्ध पर्व",
                "hne": "बस्तर दसहरा म दंतेश्वरी माई के पूजा",
            }
        },
    }
    resp = client.post("/api/v1/market-validation/content/entries", json=payload, headers=researcher_headers)
    assert resp.status_code == 201
    assert resp.json()["language"] == "hi"
    assert resp.json()["quality_breakdown"]["localization"] == 10.0


def test_missing_required_field(client: TestClient, researcher_headers: dict):
    # Missing short_description
    payload_bad = {
        "content_id": "CONT_BAD_001",
        "content_type": "DESTINATION",
        "title": "Incomplete Destination",
        "category": "HERITAGE",
    }
    resp = client.post("/api/v1/market-validation/content/entries", json=payload_bad, headers=researcher_headers)
    assert resp.status_code == 422

    # Invalid content_type
    payload_invalid_type = {
        "content_id": "CONT_BAD_002",
        "content_type": "NON_EXISTENT_TYPE",
        "title": "Invalid Type Destination",
        "category": "HERITAGE",
        "short_description": "Some description",
    }
    resp2 = client.post("/api/v1/market-validation/content/entries", json=payload_invalid_type, headers=researcher_headers)
    assert resp2.status_code == 422
