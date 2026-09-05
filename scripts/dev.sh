#!/usr/bin/env bash

set -euo pipefail

echo "Starting CG Tourism development environment..."

if ! command -v pnpm >/dev/null 2>&1; then
  echo "Error: pnpm is not installed."
  exit 1
fi

pnpm dev
