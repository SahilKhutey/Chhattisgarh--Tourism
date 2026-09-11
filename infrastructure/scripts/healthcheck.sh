#!/usr/bin/env bash

set -euo pipefail

echo "=== Infrastructure ==="
docker compose ps

echo "=== PostgreSQL ==="
docker compose exec -T postgres pg_isready -U cg_tourism -d cg_tourism

echo "=== PostGIS ==="
docker compose exec -T postgres psql -U cg_tourism -d cg_tourism -c "SELECT PostGIS_Version();"

echo "=== Redis ==="
docker compose exec -T redis redis-cli ping

echo "=== Alembic Status ==="
alembic current
alembic check

echo "=== Health check completed ==="
