from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_canonical_template_module_exists():
    path = (
        ROOT
        / "app"
        / "modules"
        / "content_template"
    )

    assert path.exists()
    assert path.is_dir()


def test_canonical_template_routes_exist():
    path = (
        ROOT
        / "app"
        / "modules"
        / "content_template"
        / "api"
        / "routes.py"
    )

    assert path.exists()
