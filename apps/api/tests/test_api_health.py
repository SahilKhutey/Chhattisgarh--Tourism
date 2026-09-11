from fastapi.testclient import TestClient
from app.main import app
from app.db.seeds.places import PLACES


def test_root_endpoint():
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "CG Tourism API"
    assert data["status"] == "running"


def test_health_endpoint():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database" in data
    assert "redis" in data
    assert data["status"] in ["healthy", "degraded"]


def test_places_seed_data_integrity():
    assert len(PLACES) > 0
    slugs = [p["slug"] for p in PLACES]
    assert len(slugs) == len(set(slugs))
