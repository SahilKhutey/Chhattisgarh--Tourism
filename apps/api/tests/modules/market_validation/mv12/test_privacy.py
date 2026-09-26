import pytest


def sanitize_telemetry(payload: dict) -> dict:
    disallowed_keys = {"password", "token", "jwt", "cvv", "card_number", "ssn", "secret"}
    return {k: v for k, v in payload.items() if k.lower() not in disallowed_keys}


def test_privacy_sanitizer_removes_sensitive_data():
    raw_payload = {
        "event_id": "ev-001",
        "action": "booking_intent",
        "user_id": "usr-123",
        "token": "secret-jwt-token-123",
        "card_number": "4111-2222-3333-4444",
    }
    sanitized = sanitize_telemetry(raw_payload)
    assert "token" not in sanitized
    assert "card_number" not in sanitized
    assert sanitized["action"] == "booking_intent"
    assert sanitized["user_id"] == "usr-123"
