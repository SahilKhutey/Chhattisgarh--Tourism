from app.modules.glossary.schemas import GlossaryCreate, GlossaryTranslation
from app.modules.glossary.service import GlossaryService
from app.modules.glossary.validator import GlossaryValidator


def test_multilingual_deprecated_term_in_hindi(db_session):
    service = GlossaryService()
    validator = GlossaryValidator()

    service.create(
        db_session,
        GlossaryCreate(
            key="archaic_temple",
            deprecated=True,
            translations=[
                GlossaryTranslation(
                    locale_code="hi",
                    term="पुराना देवालय",
                )
            ],
        ),
    )

    violations_hi = validator.validate_text(
        db_session,
        "यहाँ एक पुराना देवालय स्थित है।",
        "hi",
    )
    assert len(violations_hi) == 1
    assert "पुराना देवालय" in violations_hi[0].message

    # Should not match when searching in English
    violations_en = validator.validate_text(
        db_session,
        "An ancient temple is here.",
        "en",
    )
    assert len(violations_en) == 0


def test_case_insensitive_matching(db_session):
    service = GlossaryService()
    validator = GlossaryValidator()

    service.create(
        db_session,
        GlossaryCreate(
            key="bad_waterfall",
            deprecated=True,
            translations=[
                GlossaryTranslation(
                    locale_code="en",
                    term="Water Fall",
                )
            ],
        ),
    )

    violations = validator.validate_text(
        db_session,
        "Visit this glorious WATER FALL today.",
        "en",
    )
    assert len(violations) == 1
