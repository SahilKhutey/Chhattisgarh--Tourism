from types import SimpleNamespace

from app.modules.accessibility.service import AccessibilityService


def test_image_without_alt_text_fails():
    service = AccessibilityService()

    entry = SimpleNamespace(
        id=None,
        values={
            "hero_image": {
                "url": "image.jpg",
            }
        },
    )

    template = SimpleNamespace(
        fields=[
            SimpleNamespace(
                key="hero_image",
                type="IMAGE",
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
        issue["code"] == "IMAGE_ALT_REQUIRED"
        for issue in result["issues"]
    )


def test_image_with_alt_text_passes():
    service = AccessibilityService()

    entry = SimpleNamespace(
        id=None,
        values={
            "hero_image": {
                "url": "image.jpg",
                "alt_text": "Waterfall surrounded by forest",
            }
        },
    )

    template = SimpleNamespace(
        fields=[
            SimpleNamespace(
                key="hero_image",
                type="IMAGE",
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

    assert result["status"] == "PASS"
    assert result["score"] == 100
    assert result["issues"] == []


def test_empty_alt_text_string_fails():
    service = AccessibilityService()

    entry = SimpleNamespace(
        id=None,
        values={
            "hero_image": {
                "url": "image.jpg",
                "alt_text": "   ",
            }
        },
    )

    template = SimpleNamespace(
        fields=[
            SimpleNamespace(
                key="hero_image",
                type="IMAGE",
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
    assert any(issue["code"] == "IMAGE_ALT_REQUIRED" for issue in result["issues"])
