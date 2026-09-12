.PHONY: up down api web migrate test verify seed smoke logs health

up:
	docker compose up -d

down:
	docker compose down

api:
	cd apps/api && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

web:
	pnpm --filter web dev

migrate:
	cd apps/api && alembic upgrade head

test:
	cd apps/api && pytest -q
	pnpm --filter web test --if-present

verify:
	bash scripts/verify.sh

seed:
	python scripts/seed.py

smoke:
	bash scripts/smoke.sh

logs:
	docker compose logs -f

health:
	curl http://localhost:8000/health/live
	curl http://localhost:8000/health/ready
	curl http://localhost:8000/api/admin/health
