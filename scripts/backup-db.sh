#!/usr/bin/env bash
# ==============================================================================
# CG Tourism Platform — Automated PostgreSQL Database Backup
# ==============================================================================
# Usage:
#   ./scripts/backup-db.sh [options]
#
# Options:
#   -o, --output-dir DIR   Directory to store dumps (default: ./backups)
#   -c, --container NAME   Postgres container name (default: cg_postgres)
#   -r, --retention DAYS   Days to retain backups (default: 7, 0 to disable)
#   -u, --db-user USER     Database user (default: postgres)
#   -d, --db-name NAME     Database name (default: cg_tourism)
#   -h, --help             Show this help message
#
# Environment variables:
#   POSTGRES_CONTAINER    Override default container name
#   BACKUP_DIR            Override default output directory
#   BACKUP_RETENTION_DAYS Days to retain backups
#   DATABASE_URL          Direct database connection string (if not using docker)
# ==============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# Default parameters
BACKUP_DIR="${BACKUP_DIR:-./backups}"
CONTAINER="${POSTGRES_CONTAINER:-cg_postgres}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-cg_tourism}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -o|--output-dir)
      BACKUP_DIR="$2"
      shift 2
      ;;
    -c|--container)
      CONTAINER="$2"
      shift 2
      ;;
    -r|--retention)
      RETENTION_DAYS="$2"
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

# Create destination directory
mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
FILENAME="cg_tourism_backup_${TIMESTAMP}.dump"
FILEPATH="${BACKUP_DIR}/${FILENAME}"

log_info "Initiating PostgreSQL backup..."
log_info "Target file: ${FILEPATH}"

# Detect execution strategy: docker container vs direct pg_dump
if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -Eq "^${CONTAINER}$"; then
  log_info "Running pg_dump inside Docker container '${CONTAINER}'..."
  docker exec -t "${CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" -F c -b -v > "${FILEPATH}"
elif command -v pg_dump >/dev/null 2>&1; then
  log_info "Running local pg_dump..."
  if [[ -n "${DATABASE_URL:-}" ]]; then
    pg_dump -d "${DATABASE_URL}" -F c -b -v -f "${FILEPATH}"
  else
    pg_dump -U "${DB_USER}" -d "${DB_NAME}" -F c -b -v -f "${FILEPATH}"
  fi
else
  log_error "Neither running Docker container '${CONTAINER}' nor local 'pg_dump' executable found."
  exit 1
fi

# Verify backup artifact
if [[ -f "${FILEPATH}" ]] && [[ -s "${FILEPATH}" ]]; then
  SIZE=$(du -h "${FILEPATH}" | cut -f1)
  log_success "Backup completed successfully! Size: ${SIZE} (${FILEPATH})"
else
  log_error "Backup file is missing or empty: ${FILEPATH}"
  exit 1
fi

# Retention pruning
if [[ "${RETENTION_DAYS}" -gt 0 ]]; then
  log_info "Applying retention policy: deleting backups older than ${RETENTION_DAYS} days..."
  find "${BACKUP_DIR}" -type f -name "cg_tourism_backup_*.dump" -mtime +"${RETENTION_DAYS}" -print -delete || true
fi

log_success "Database backup job finished."
