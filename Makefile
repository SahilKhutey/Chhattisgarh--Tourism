.PHONY: up down logs db-migrate db-revision db-seed db-reset test test-unit test-integration health

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

db-migrate:
	alembic upgrade head

db-revision:
	alembic revision --autogenerate -m "$(message)"

db-seed:
	PYTHONPATH=. python -m app.db.seeds.seed

db-reset:
	docker compose down -v
	docker compose up -d postgres redis
	sleep 5
	alembic upgrade head
	PYTHONPATH=. python -m app.db.seeds.seed

test:
	pytest -q

test-unit:
	pytest tests/unit -q

test-integration:
	pytest tests/integration -q

health:
	curl http://localhost:8000/health
