from pathlib import Path
from collections import defaultdict
import hashlib

ROOT = Path(__file__).resolve().parents[2]

TARGETS = {
    "TemplateBuilder.tsx",
    "TemplatePreview.tsx",
    "DynamicEntryForm.tsx",
    "ContentRenderer.tsx",
}

groups = defaultdict(list)

for path in ROOT.rglob("*"):
    if not path.is_file():
        continue

    if path.name not in TARGETS:
        continue

    if any(
        part in {".git", "node_modules", ".venv", "dist", "build", ".next", ".turbo"}
        for part in path.parts
    ):
        continue

    digest = hashlib.sha256(
        path.read_bytes()
    ).hexdigest()

    groups[path.name].append(
        (path, digest)
    )

for filename, entries in sorted(groups.items()):
    print(f"\n=== {filename} ===")

    for path, digest in entries:
        print(
            f"{path.relative_to(ROOT)}"
            f" | SHA256={digest}"
        )
