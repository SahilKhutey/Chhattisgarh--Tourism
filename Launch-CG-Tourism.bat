@echo off
title CG Tourism Platform
echo ==================================================
echo Launching Chhattisgarh Tourism Platform (ATIS)
echo ==================================================
echo.
echo Starting the Backend API and Frontend Web App...
echo.

cd /d "%~dp0"
call pnpm install

echo Starting Backend API (Port 4000)...
start "Backend API" cmd /k "cd /d apps\backend && pnpm run dev"

echo Starting Frontend Web App (Port 3000)...
start "Frontend App" cmd /k "cd /d apps\web && pnpm run dev"

echo Both services launched in separate windows!

pause
