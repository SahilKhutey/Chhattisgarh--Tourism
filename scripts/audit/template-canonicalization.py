from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

SEARCH_TERMS = [
    "TemplateBuilder",
    "TemplatePreview",
    "DynamicEntryForm",
    "ContentRenderer",
    "content-template",
    "content-templates",
    "content-entries",
]

EXTENSIONS = {
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".py",
}

for term in SEARCH_TERMS:
    print(f"\n=== {term} ===")

    matches = []

    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue

        if path.suffix not in EXTENSIONS:
            continue

        if any(part in {".git", "node_modules", ".venv", ".turbo", "dist", ".next"} for part in path.parts):
            continue

        try:
            text = path.read_text(
                encoding="utf-8",
                errors="ignore",
            )
        except OSError:
            continue

        if term in text:
            matches.append(path)

    for path in sorted(matches):
        print(path.relative_to(ROOT))
