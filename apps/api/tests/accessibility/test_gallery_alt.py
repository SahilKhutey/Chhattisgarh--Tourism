from types import SimpleNamespace

from app.modules.accessibility.service import AccessibilityService


def test_gallery_requires_alt_text():
    service = AccessibilityService()

    entry = SimpleNamespace(
        id=None,
        values={
            "gallery": [
                {
                    "url": "one.jpg",
                    "alt_text": "Forest",
                },
                {
                    "url": "two.jpg",
                },
            ]
        },
    )

    template = SimpleNamespace(
        fields=[
            SimpleNamespace(
                key="gallery",
                type="GALLERY",
            )
        ]
    )

    result = service.audit_entry(
        db=None,
        entry=entry,
        template=template,
        locale_code="en",
        persist=False,
    )

    assert result["status"] == "FAIL"
    assert result["score"] == 80
    assert any(
        issue["code"] == "GALLERY_ALT_REQUIRED"
        for issue in result["issues"]
    )


def test_gallery_all_valid_passes():
    service = AccessibilityService()

    entry = SimpleNamespace(
        id=None,
        values={
            "gallery": [
                {"url": "one.jpg", "alt_text": "Forest canopy"},
                {"url": "two.jpg", "alt_text": "Stream running through valley"},
            ]
        },
    )

    template = SimpleNamespace(
        fields=[SimpleNamespace(key="gallery", type="GALLERY")]
    )

    result = service.audit_entry(
        db=None,
        entry=entry,
        template=template,
        locale_code="en",
        persist=False,
    )

    assert result["status"] == "PASS"
    assert result["score"] == 100
    assert len(result["issues"]) == 0


def test_gallery_multiple_missing_alt_calculates_score():
    service = AccessibilityService()

    entry = SimpleNamespace(
        id=None,
        values={
            "gallery": [
                {"url": "1.jpg"},
                {"url": "2.jpg"},
                {"url": "3.jpg"},
            ]
        },
    )

    template = SimpleNamespace(
        fields=[SimpleNamespace(key="gallery", type="GALLERY")]
    )

    result = service.audit_entry(
        db=None,
        entry=entry,
        template=template,
        locale_code="en",
        persist=False,
    )

    assert result["status"] == "FAIL"
    assert result["score"] == 40  # 100 - 3 * 20
    assert len(result["issues"]) == 3
