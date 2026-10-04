import pytest
from app.modules.social.creators.validator import CreatorValidator
from app.modules.social.creators.duplicate import CreatorDuplicateService
from app.modules.social.creators.schemas import CreatorCreate
from app.modules.social.models.creator import Creator


def test_creator_validator_valid():
    validator = CreatorValidator()
    res = validator.validate(
        display_name="Bastar Artisan Guild",
        slug="bastar_artisan",
        bio="Promoting Bell Metal and Dhokra crafts of Kondagaon and Jagdalpur.",
        district_id="kondagaon",
        tourism_zone="BASTAR_CULTURE",
    )
    assert res.valid is True
    assert len(res.issues) == 0


def test_creator_validator_empty_display_name():
    validator = CreatorValidator()
    res = validator.validate(
        display_name="   ",
        slug="bastar_artisan",
        bio="Some bio",
    )
    assert res.valid is False
    assert any(i.field == "display_name" and i.code == "REQUIRED" for i in res.issues)


def test_creator_validator_display_name_too_long():
    validator = CreatorValidator()
    res = validator.validate(
        display_name="A" * 125,
        slug="bastar_artisan",
    )
    assert res.valid is False
    assert any(i.field == "display_name" and i.code == "TOO_LONG" for i in res.issues)


def test_creator_validator_missing_slug():
    validator = CreatorValidator()
    res = validator.validate(
        display_name="Valid Creator",
        slug="   ",
    )
    assert res.valid is False
    assert any(i.field == "slug" and i.code == "REQUIRED" for i in res.issues)


def test_creator_validator_bio_too_long():
    validator = CreatorValidator()
    res = validator.validate(
        display_name="Bastar Artisan",
        slug="bastar_artisan",
        bio="B" * 1005,
    )
    assert res.valid is False
    assert any(i.field == "bio" and i.code == "TOO_LONG" for i in res.issues)


def test_creator_validator_tourism_zone_without_district():
    validator = CreatorValidator()
    res = validator.validate(
        display_name="Bastar Artisan",
        slug="bastar_artisan",
        tourism_zone="BASTAR_CULTURE",
        district_id=None,
    )
    assert res.valid is False
    assert any(i.field == "district_id" and i.code == "DISTRICT_REQUIRED" for i in res.issues)


def test_creator_validator_from_object():
    validator = CreatorValidator()
    payload = CreatorCreate(
        handle="dantewada_tribal",
        display_name="Dantewada Tribal Crafts",
        district_id="dantewada",
        bio="Local woodwork and iron crafts.",
    )
    res = validator.validate(payload)
    assert res.valid is True


def test_creator_duplicate_detection():
    service = CreatorDuplicateService()

    existing = [
        Creator(
            handle="bastar_explorer",
            display_name="Bastar Explorer Official",
            district_id="bastar",
        ),
        Creator(
            handle="raipur_foodie",
            display_name="Raipur Foodie",
            district_id="raipur",
        ),
    ]

    result = service.find_candidates_sync(
        display_name="Bastar Explorer",
        district_id="bastar",
        existing_creators=existing,
        min_confidence=0.6,
    )

    candidates = result["possible_duplicates"]
    assert len(candidates) >= 1
    top = candidates[0]
    assert top["handle"] == "bastar_explorer"
    assert top["confidence"] > 0.6
