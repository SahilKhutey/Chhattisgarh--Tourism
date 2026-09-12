#!/usr/bin/env bash
# ==============================================================================
# CG Tourism Platform — Full System Verification Script
# ==============================================================================
set -euo pipefail

echo "================================================================="
echo "  CG TOURISM — SYSTEM VERIFICATION"
echo "================================================================="

if command -v python3 &>/dev/null; then
  PYTHON=python3
elif command -v python &>/dev/null; then
  PYTHON=python
else
  echo "Python not found! Please install Python 3.12+"
  exit 1
fi

echo "[1/4] Checking Python backend compilation..."
(cd apps/api && $PYTHON -m compileall app)
echo "✔ Python compile check passed"

echo "[2/4] Checking Alembic migrations status..."
(cd apps/api && $PYTHON -c "import alembic.config; alembic.config.main(argv=['heads'])")
echo "✔ Alembic heads check passed"

echo "[3/4] Running Backend test suites (pytest)..."
(cd apps/api && $PYTHON -m pytest -q)
echo "✔ Backend tests passed"

echo "[4/4] Checking Frontend typecheck..."
if command -v pnpm &>/dev/null; then
  pnpm --filter web run typecheck
else
  (cd apps/web && npm run typecheck)
fi
echo "✔ Frontend typecheck passed"

echo "================================================================="
echo "  ALL SYSTEM VERIFICATION CHECKS PASSED SUCCESSFULLY!"
echo "================================================================="
