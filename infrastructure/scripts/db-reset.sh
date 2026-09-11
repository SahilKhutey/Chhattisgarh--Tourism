#!/usr/bin/env bash

set -euo pipefail

docker compose down -v
docker compose up -d postgres redis

echo "Waiting for PostgreSQL..."
until docker compose exec -T postgres pg_isready -U cg_tourism -d cg_tourism; do
    sleep 2
done

echo "Running migrations..."
alembic upgrade head

echo "Running seeds..."
PYTHONPATH=. python -m app.db.seeds.seed

echo "Database reset completed."
