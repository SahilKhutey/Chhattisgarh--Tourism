#!/usr/bin/env bash

set -euo pipefail

echo "Executing idempotent database seeding..."
PYTHONPATH=. python -m app.db.seeds.seed
echo "Database seeding completed."
