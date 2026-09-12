# CG Tourism Platform - Full System Verification Script (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  CG TOURISM - SYSTEM VERIFICATION" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

Write-Host "[1/4] Checking Python backend compilation..." -ForegroundColor Yellow
Push-Location apps/api
python -m compileall app
if ($LASTEXITCODE -ne 0) { throw "Compile check failed!" }
Write-Host "✔ Python compile check passed" -ForegroundColor Green

Write-Host "[2/4] Checking Alembic migrations status..." -ForegroundColor Yellow
python -c 'import alembic.config; alembic.config.main(argv=["heads"])'
if ($LASTEXITCODE -ne 0) { throw "Alembic check failed!" }
Write-Host "✔ Alembic heads check passed" -ForegroundColor Green

Write-Host "[3/4] Running Backend test suites (pytest)..." -ForegroundColor Yellow
python -m pytest tests/integration tests/security tests/contract -q
if ($LASTEXITCODE -ne 0) { throw "Backend tests failed!" }
Write-Host "✔ Backend integration tests passed" -ForegroundColor Green
Pop-Location

Write-Host "[4/4] Checking Frontend typecheck..." -ForegroundColor Yellow
Push-Location apps/web
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw "Typecheck failed!" }
Write-Host "✔ Frontend typecheck passed" -ForegroundColor Green
Pop-Location

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  ALL SYSTEM VERIFICATION CHECKS PASSED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Cyan
