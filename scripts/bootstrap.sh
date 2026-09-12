#!/usr/bin/env bash
# ==============================================================================
# CG Tourism Platform — Bootstrap Script
# ==============================================================================
set -euo pipefail

echo "==> [1/4] Setting up environment files..."
if [ ! -f apps/api/.env ]; then
  if [ -f apps/api/.env.example ]; then
    cp apps/api/.env.example apps/api/.env
    echo "Created apps/api/.env from .env.example"
  fi
fi

if [ ! -f apps/web/.env ]; then
  if [ -f apps/web/.env.example ]; then
    cp apps/web/.env.example apps/web/.env
    echo "Created apps/web/.env from .env.example"
  fi
fi

echo "==> [2/4] Installing Python backend dependencies..."
if command -v python3 &>/dev/null; then
  PYTHON=python3
elif command -v python &>/dev/null; then
  PYTHON=python
else
  echo "Python not found! Please install Python 3.12+"
  exit 1
fi

$PYTHON -m pip install --upgrade pip
$PYTHON -m pip install -r apps/api/requirements.txt

echo "==> [3/4] Installing Node.js frontend dependencies..."
if command -v pnpm &>/dev/null; then
  pnpm install
elif command -v npm &>/dev/null; then
  npm install
else
  echo "pnpm / npm not found! Please install Node 20+ and pnpm"
  exit 1
fi

echo "==> [4/4] Running database migrations..."
(cd apps/api && $PYTHON -m alembic upgrade head)

echo "==> Bootstrap completed successfully!"
