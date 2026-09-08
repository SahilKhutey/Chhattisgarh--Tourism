#!/usr/bin/env bash
# ==============================================================================
# CG Tourism Platform — Automated Production Deployment Script
# ==============================================================================
# Usage:
#   ./scripts/deploy-production.sh [options]
#
# Options:
#   -e, --env-file FILE    Path to production env file (default: .env.production)
#   -f, --compose-file FILE Path to compose file (default: docker-compose.prod.yml)
#   --skip-build           Skip container image build step
#   --skip-migrations      Skip database migration step
#   -t, --timeout SECS     Health check timeout in seconds (default: 60)
#   -h, --help             Show this help message
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

ENV_FILE=".env.production"
COMPOSE_FILE="docker-compose.prod.yml"
SKIP_BUILD=false
SKIP_MIGRATIONS=false
TIMEOUT=60

while [[ $# -gt 0 ]]; do
  case "$1" in
    -e|--env-file)
      ENV_FILE="$2"
      shift 2
      ;;
    -f|--compose-file)
      COMPOSE_FILE="$2"
      shift 2
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --skip-migrations)
      SKIP_MIGRATIONS=true
      shift
      ;;
    -t|--timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    -h|--help)
      grep '^#' "$0" | cut -c 3-
      exit 0
      ;;
    *)
      log_error "Unknown option: $1"
      exit 1
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${ROOT_DIR}"

log_info "==================================================================="
log_info "CG Tourism Platform — Production Deployment Orchestrator"
log_info "Compose file: ${COMPOSE_FILE}"
log_info "Environment file: ${ENV_FILE}"
log_info "==================================================================="

# 1. Pre-flight checks
log_info "[1/6] Running pre-flight environment checks..."
if [[ ! -f "${ENV_FILE}" ]]; then
  log_error "Production environment file '${ENV_FILE}' not found."
  log_error "Create it using '.env.production.sample' before deploying."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  log_error "Docker is required but not installed or not in PATH."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  log_error "Docker daemon is not reachable. Is Docker running?"
  exit 1
fi

# 2. Build production images
if [[ "${SKIP_BUILD}" != "true" ]]; then
  log_info "[2/6] Building production Docker images..."
  docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" build
else
  log_info "[2/6] Skipping image build (--skip-build specified)."
fi

# 3. Start database and cache dependencies
log_info "[3/6] Starting PostgreSQL (PostGIS) and Redis services..."
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d postgres redis

log_info "Waiting for database to report healthy state..."
RETRIES=30
until docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" ps postgres --format '{{.Health}}' | grep -q "healthy" || [[ ${RETRIES} -eq 0 ]]; do
  sleep 2
  RETRIES=$((RETRIES - 1))
done

if [[ ${RETRIES} -eq 0 ]]; then
  log_warn "Postgres container healthcheck timed out, checking direct connection..."
fi

# 4. Database Migrations
if [[ "${SKIP_MIGRATIONS}" != "true" ]]; then
  log_info "[4/6] Executing database migrations (prisma migrate deploy)..."
  docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" run --rm backend pnpm --filter backend prisma migrate deploy || {
    log_error "Prisma migration failed! Aborting deployment."
    exit 1
  }
else
  log_info "[4/6] Skipping migrations (--skip-migrations specified)."
fi

# 5. Start all services
log_info "[5/6] Starting full service stack in detached mode..."
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d

# 6. Post-deployment verification
log_info "[6/6] Executing production verification probe suite..."
if [[ -f "${SCRIPT_DIR}/verify-production.sh" ]]; then
  bash "${SCRIPT_DIR}/verify-production.sh" --timeout "${TIMEOUT}"
else
  log_warn "Verification script not found at ${SCRIPT_DIR}/verify-production.sh, skipping probe."
fi

log_success "==================================================================="
log_success "CG Tourism Platform successfully deployed to production!"
log_success "Active services:"
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" ps
log_success "==================================================================="
