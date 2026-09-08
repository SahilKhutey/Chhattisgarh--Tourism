#!/usr/bin/env bash
# ==============================================================================
# CG Tourism Platform — Production Health & Readiness Verification
# ==============================================================================
# Usage:
#   ./scripts/verify-production.sh [options]
#
# Options:
#   -a, --api-url URL     Base URL for backend API (default: http://localhost:4000)
#   -w, --web-url URL     Base URL for web application (default: http://localhost:3000)
#   -t, --timeout SECS    Total wait timeout in seconds (default: 60)
#   -i, --interval SECS   Interval between retry checks (default: 3)
#   --skip-web            Skip web frontend verification
#   -h, --help            Show this help message
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

API_URL="${API_URL:-http://localhost:4000}"
WEB_URL="${WEB_URL:-http://localhost:3000}"
TIMEOUT=60
INTERVAL=3
SKIP_WEB=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -a|--api-url)
      API_URL="$2"
      shift 2
      ;;
    -w|--web-url)
      WEB_URL="$2"
      shift 2
      ;;
    -t|--timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    -i|--interval)
      INTERVAL="$2"
      shift 2
      ;;
    --skip-web)
      SKIP_WEB=true
      shift
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

# Strip trailing slashes
API_URL="${API_URL%/}"
WEB_URL="${WEB_URL%/}"

log_info "Verifying CG Tourism Platform Deployment Health..."
log_info "API target: ${API_URL}"
if [[ "${SKIP_WEB}" != "true" ]]; then
  log_info "Web target: ${WEB_URL}"
fi

check_endpoint() {
  local url="$1"
  local expected_status="${2:-200}"
  local response
  local http_code

  response=$(curl -s -w "\n%{http_code}" --connect-timeout 5 --max-time 10 "${url}" 2>/dev/null || echo -e "\n000")
  http_code=$(echo "${response}" | tail -n1)
  body=$(echo "${response}" | sed '$d')

  if [[ "${http_code}" == "${expected_status}" ]]; then
    echo "${body}"
    return 0
  else
    return 1
  fi
}

poll_endpoint() {
  local name="$1"
  local url="$2"
  local elapsed=0

  log_info "Checking ${name} at ${url} (timeout: ${TIMEOUT}s)..."
  while [[ ${elapsed} -lt ${TIMEOUT} ]]; do
    if res=$(check_endpoint "${url}" 200); then
      log_success "${name} is healthy! (HTTP 200)"
      return 0
    fi
    sleep "${INTERVAL}"
    elapsed=$((elapsed + INTERVAL))
  done

  log_error "Timed out waiting for ${name} at ${url}"
  return 1
}

# 1. Check API Liveness Probe (/api/v1/health/live)
poll_endpoint "API Liveness Probe" "${API_URL}/api/v1/health/live"

# 2. Check API Readiness Probe (/api/v1/health/ready) - validates DB and memory
poll_endpoint "API Readiness Probe (Database & Memory)" "${API_URL}/api/v1/health/ready"

# 3. Check General Diagnostics (/api/v1/health)
poll_endpoint "API Diagnostic Health Probe" "${API_URL}/api/v1/health"

# 4. Check Web Frontend (if not skipped)
if [[ "${SKIP_WEB}" != "true" ]]; then
  poll_endpoint "Web Frontend Application" "${WEB_URL}"
fi

log_success "==================================================================="
log_success "All production health and readiness checks PASSED!"
log_success "Platform is active, connected, and serving requests."
log_success "==================================================================="
