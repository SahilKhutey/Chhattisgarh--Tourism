from types import SimpleNamespace
from app.modules.content_template.services.version_diff import (
    compare_versions,
    summarize_diff,
)


def make_field(
    key,
    label="Label",
    field_type="TEXT",
    required=False,
    translatable=True,
    order=0,
    group="General",
    help_text=None,
    config=None,
):
    return SimpleNamespace(
        key=key,
        label=label,
        type=field_type,
        field_type=field_type,
        required=required,
        translatable=translatable,
        order=order,
        group=group,
        group_name=group,
        help_text=help_text,
        config=config or {},
    )


def make_version(
    version_number=1,
    name="Test Template",
    slug="test-template",
    description="Description",
    icon="map-pin",
    category="attraction",
    fields=None,
):
    return SimpleNamespace(
        version_number=version_number,
        name=name,
        slug=slug,
        description=description,
        icon=icon,
        category=category,
        fields=fields or [],
    )


def test_added_optional_field_is_non_breaking():
    v1 = make_version(fields=[make_field("title")])
    v2 = make_version(fields=[make_field("title"), make_field("notes", required=False)])

    diff = compare_versions(v1, v2)
    assert len(diff.added) == 1
    assert diff.added[0].key == "notes"
    assert diff.added[0].breaking is False
    assert diff.breaking is False


def test_added_required_field_is_breaking():
    v1 = make_version(fields=[make_field("title")])
    v2 = make_version(fields=[make_field("title"), make_field("code", required=True)])

    diff = compare_versions(v1, v2)
    assert len(diff.added) == 1
    assert diff.added[0].key == "code"
    assert diff.added[0].breaking is True
    assert diff.breaking is True


def test_removed_field_is_breaking():
    v1 = make_version(fields=[make_field("title"), make_field("legacy")])
    v2 = make_version(fields=[make_field("title")])

    diff = compare_versions(v1, v2)
    assert len(diff.removed) == 1
    assert diff.removed[0].key == "legacy"
    assert diff.removed[0].breaking is True
    assert diff.breaking is True


def test_type_change_is_breaking():
    v1 = make_version(fields=[make_field("rating", field_type="TEXT")])
    v2 = make_version(fields=[make_field("rating", field_type="NUMBER")])

    diff = compare_versions(v1, v2)
    assert any(
        change.change == "TYPE_CHANGED" and change.breaking for change in diff.changed
    )
    assert diff.breaking is True


def test_label_change_is_not_breaking():
    v1 = make_version(fields=[make_field("title", label="Old Title")])
    v2 = make_version(fields=[make_field("title", label="New Title")])

    diff = compare_versions(v1, v2)
    assert any(
        change.change == "LABEL_CHANGED" and not change.breaking for change in diff.changed
    )
    assert diff.breaking is False


def test_reorder_is_non_breaking():
    v1 = make_version(fields=[make_field("a", order=0), make_field("b", order=1)])
    v2 = make_version(fields=[make_field("b", order=0), make_field("a", order=1)])

    diff = compare_versions(v1, v2)
    assert len(diff.reordered) == 2
    assert diff.breaking is False


def test_config_change_is_breaking():
    v1 = make_version(fields=[make_field("select", config={"options": ["A", "B"]})])
    v2 = make_version(fields=[make_field("select", config={"options": ["A"]})])

    diff = compare_versions(v1, v2)
    assert any(
        change.change == "CONFIG_CHANGED" and change.breaking for change in diff.changed
    )
    assert diff.breaking is True


def test_summarize_diff_risk_levels():
    v1 = make_version(fields=[make_field("title")])
    v2 = make_version(fields=[make_field("title"), make_field("code", required=True)])

    diff_breaking = compare_versions(v1, v2)
    summary_high = summarize_diff(diff_breaking)
    assert summary_high["risk_level"] == "HIGH"
    assert summary_high["breaking"] is True
    assert len(summary_high["actions"]) > 0

    v3 = make_version(fields=[make_field("title", label="New")])
    diff_low = compare_versions(v1, v3)
    summary_low = summarize_diff(diff_low)
    assert summary_low["risk_level"] == "LOW"
    assert summary_low["breaking"] is False
