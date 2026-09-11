from app.modules.glossary.schemas import GlossaryCreate, GlossaryTranslation
from app.modules.glossary.service import GlossaryService
from app.modules.glossary.validator import GlossaryValidator


def test_deprecated_term_is_detected(db_session):
    service = GlossaryService()
    validator = GlossaryValidator()

    service.create(
        db_session,
        GlossaryCreate(
            key="old_tourist_spot",
            definition="Deprecated legacy term",
            deprecated=True,
            preferred=False,
            translations=[
                GlossaryTranslation(
                    locale_code="en",
                    term="tourist spot",
                    synonyms=["picnic point"],
                )
            ],
        ),
    )

    violations = validator.validate_text(
        db_session,
        "Visit the beautiful tourist spot in Bastar.",
        "en",
    )

    assert len(violations) == 1
    assert violations[0].key == "old_tourist_spot"
    assert violations[0].severity == "WARNING"
    assert "tourist spot" in violations[0].message


def test_deprecated_synonym_is_detected(db_session):
    service = GlossaryService()
    validator = GlossaryValidator()

    service.create(
        db_session,
        GlossaryCreate(
            key="old_picnic_term",
            definition="Deprecated",
            deprecated=True,
            translations=[
                GlossaryTranslation(
                    locale_code="en",
                    term="shady spot",
                    synonyms=["picnic point"],
                )
            ],
        ),
    )

    violations = validator.validate_text(
        db_session,
        "A great picnic point for families.",
        "en",
    )

    assert len(violations) == 1
    assert violations[0].key == "old_picnic_term"
    assert "picnic point" in violations[0].text


def test_preferred_term_does_not_trigger_violation(db_session):
    service = GlossaryService()
    validator = GlossaryValidator()

    service.create(
        db_session,
        GlossaryCreate(
            key="tourist_destination",
            preferred=True,
            deprecated=False,
            translations=[
                GlossaryTranslation(
                    locale_code="en",
                    term="tourist destination",
                )
            ],
        ),
    )

    violations = validator.validate_text(
        db_session,
        "Discover this premier tourist destination.",
        "en",
    )

    assert len(violations) == 0


def test_configurable_severity(db_session):
    service = GlossaryService()
    validator = GlossaryValidator()

    service.create(
        db_session,
        GlossaryCreate(
            key="blocked_word",
            deprecated=True,
            translations=[
                GlossaryTranslation(
                    locale_code="en",
                    term="forbidden_place",
                )
            ],
        ),
    )

    violations = validator.validate_text(
        db_session,
        "Do not visit forbidden_place.",
        "en",
        severity_override="BLOCKER",
    )

    assert len(violations) == 1
    assert violations[0].severity == "BLOCKER"
