import pytest
from app.modules.glossary.schemas import GlossaryCreate, GlossaryTranslation, GlossaryUpdate
from app.modules.glossary.service import GlossaryService


def test_create_glossary_term_success(db_session):
    service = GlossaryService()
    payload = GlossaryCreate(
        key="tourist_destination",
        definition="A location for visitors.",
        context="Tourism",
        preferred=True,
        deprecated=False,
        translations=[
            GlossaryTranslation(locale_code="en", term="Tourist Destination", synonyms=["Tourist Spot"]),
            GlossaryTranslation(locale_code="hi", term="पर्यटन स्थल", synonyms=[]),
        ],
    )
    term = service.create(db_session, payload)
    assert term.id is not None
    assert term.key == "tourist_destination"
    assert len(term.translations) == 2


def test_create_duplicate_key_fails(db_session):
    service = GlossaryService()
    payload = GlossaryCreate(
        key="waterfall",
        definition="Water fall",
    )
    service.create(db_session, payload)

    with pytest.raises(ValueError) as exc:
        service.create(db_session, payload)
    assert "already exists" in str(exc.value)


def test_update_glossary_term(db_session):
    service = GlossaryService()
    term = service.create(
        db_session,
        GlossaryCreate(
            key="chitrakote",
            definition="Niagara of India",
        ),
    )
    updated = service.update(
        db_session,
        term.id,
        GlossaryUpdate(
            definition="The famous Chitrakote waterfall",
            deprecated=True,
        ),
    )
    assert updated.definition == "The famous Chitrakote waterfall"
    assert updated.deprecated is True


def test_delete_glossary_term(db_session):
    service = GlossaryService()
    term = service.create(
        db_session,
        GlossaryCreate(key="temp_key"),
    )
    assert service.delete(db_session, term.id) is True
    assert service.get(db_session, term.id) is None
    assert service.delete(db_session, 999999) is False
