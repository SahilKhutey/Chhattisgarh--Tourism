#!/usr/bin/env bash
# ==============================================================================
# CG Tourism Platform — Smoke Test Script
# ==============================================================================
set -euo pipefail

API_URL="${API_URL:-http://localhost:8000}"
echo "Running smoke tests against ${API_URL}..."

check_endpoint() {
  local endpoint="$1"
  local expected_status="${2:-200}"
  local url="${API_URL}${endpoint}"
  
  echo -n "Checking ${endpoint} ... "
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "${url}" || echo "000")
  
  if [ "$http_code" -eq "$expected_status" ]; then
    echo "OK ($http_code)"
  else
    echo "FAILED (Expected $expected_status, got $http_code)"
    return 1
  fi
}

# Run probes
check_endpoint "/health/live" 200
check_endpoint "/health/ready" 200
check_endpoint "/api/admin/health" 200
check_endpoint "/api/public/destinations" 200
check_endpoint "/api/search?q=Bastar" 200

echo "All smoke tests passed successfully!"
