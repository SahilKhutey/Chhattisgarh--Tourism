#!/usr/bin/env bash

set -euo pipefail

echo "Running Alembic migrations to head..."
alembic upgrade head
echo "Migrations applied successfully."
