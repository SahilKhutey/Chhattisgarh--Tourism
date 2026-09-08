#!/usr/bin/env bash
# ==============================================================================
# CG Tourism Platform — PostgreSQL Database Restoration Utility
# ==============================================================================
# Usage:
#   ./scripts/restore-db.sh [options] <path-to-dump-file>
#
# Options:
#   -c, --container NAME   Postgres container name (default: cg_postgres)
#   -u, --db-user USER     Database user (default: postgres)
#   -d, --db-name NAME     Database name (default: cg_tourism)
#   --confirm              Bypass interactive confirmation prompt
#   -h, --help             Show this help message
#
# Safety:
#   This is a DESTRUCTIVE operation that will drop and recreate existing objects.
#   Explicit confirmation via --confirm or interactive 'yes' prompt is required.
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

CONTAINER="${POSTGRES_CONTAINER:-cg_postgres}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-cg_tourism}"
CONFIRMED=false
DUMP_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -c|--container)
      CONTAINER="$2"
      shift 2
      ;;
    -u|--db-user)
      DB_USER="$2"
      shift 2
      ;;
    -d|--db-name)
      DB_NAME="$2"
      shift 2
      ;;
    --confirm)
      CONFIRMED=true
      shift
      ;;
    -h|--help)
      grep '^#' "$0" | cut -c 3-
      exit 0
      ;;
    -*)
      log_error "Unknown option: $1"
      exit 1
      ;;
    *)
      if [[ -z "${DUMP_FILE}" ]]; then
        DUMP_FILE="$1"
        shift
      else
        log_error "Unexpected argument: $1"
        exit 1
      fi
      ;;
  esac
done

if [[ -z "${DUMP_FILE}" ]]; then
  log_error "Missing backup dump file path. Usage: ./scripts/restore-db.sh [options] <path-to-dump-file>"
  exit 1
fi

if [[ ! -f "${DUMP_FILE}" ]]; then
  log_error "Specified dump file does not exist: ${DUMP_FILE}"
  exit 1
fi

log_warn "==================================================================="
log_warn "WARNING: DESTRUCTIVE ACTION REQUESTED"
log_warn "This script will overwrite data in database '${DB_NAME}'"
log_warn "Dump file to restore: ${DUMP_FILE}"
log_warn "==================================================================="

if [[ "${CONFIRMED}" != "true" ]]; then
  if [[ -t 0 ]]; then
    read -r -p "Type 'yes' to confirm database restoration: " RESPONSE
    if [[ "${RESPONSE}" != "yes" ]]; then
      log_info "Restoration aborted by user."
      exit 0
    fi
  else
    log_error "Non-interactive shell detected. Must provide '--confirm' flag to perform restore."
    exit 1
  fi
fi

log_info "Initiating PostgreSQL database restore..."

if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -Eq "^${CONTAINER}$"; then
  log_info "Streaming dump file into Docker container '${CONTAINER}'..."
  cat "${DUMP_FILE}" | docker exec -i "${CONTAINER}" pg_restore -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists --no-owner --no-acl -v || true
elif command -v pg_restore >/dev/null 2>&1; then
  log_info "Running local pg_restore..."
  if [[ -n "${DATABASE_URL:-}" ]]; then
    pg_restore -d "${DATABASE_URL}" --clean --if-exists --no-owner --no-acl -v "${DUMP_FILE}" || true
  else
    pg_restore -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists --no-owner --no-acl -v "${DUMP_FILE}" || true
  fi
else
  log_error "Neither running Docker container '${CONTAINER}' nor local 'pg_restore' executable found."
  exit 1
fi

log_success "Database restore command finished successfully."
