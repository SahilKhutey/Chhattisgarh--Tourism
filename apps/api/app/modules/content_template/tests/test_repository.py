import uuid

from app.modules.content_template.models import ContentTemplate, TemplateField
from app.modules.content_template.repositories.template_repository import (
    TemplateRepository,
)


def test_repository_create_and_get(db_session):
    repo = TemplateRepository()

    template = ContentTemplate(
        id=uuid.uuid4(),
        name="Bastar Tourism",
        slug="bastar-tourism",
        description="Tribal heritage in Bastar",
        category="heritage",
        status="DRAFT",
    )
    repo.add(db_session, template)
    db_session.commit()

    fetched = repo.get(db_session, template.id)
    assert fetched is not None
    assert fetched.name == "Bastar Tourism"
    assert fetched.slug == "bastar-tourism"


def test_repository_get_by_slug(db_session):
    repo = TemplateRepository()

    template = ContentTemplate(
        id=uuid.uuid4(),
        name="Sirpur Heritage",
        slug="sirpur-heritage",
        category="monument",
        status="DRAFT",
    )
    repo.add(db_session, template)
    db_session.commit()

    fetched = repo.get_by_slug(db_session, "sirpur-heritage")
    assert fetched is not None
    assert fetched.slug == "sirpur-heritage"


def test_repository_list(db_session):
    repo = TemplateRepository()

    for idx in range(3):
        template = ContentTemplate(
            id=uuid.uuid4(),
            name=f"Template {idx}",
            slug=f"template-{idx}",
            status="DRAFT",
        )
        repo.add(db_session, template)
    db_session.commit()

    templates = repo.list(db_session, limit=10)
    assert len(templates) >= 3


def test_repository_cascading_delete(db_session):
    repo = TemplateRepository()

    template = ContentTemplate(
        id=uuid.uuid4(),
        name="Cascading Template",
        slug="cascading-template",
        status="DRAFT",
    )
    repo.add(db_session, template)
    db_session.flush()

    field = TemplateField(
        id=uuid.uuid4(),
        template_id=template.id,
        key="title",
        label="Title",
        field_type="TEXT",
        order=0,
    )
    db_session.add(field)
    db_session.commit()

    db_session.delete(template)
    db_session.commit()

    assert repo.get(db_session, template.id) is None
    remaining_fields = db_session.query(TemplateField).filter_by(template_id=template.id).all()
    assert len(remaining_fields) == 0
