@echo off
setlocal

echo Starting CG Tourism development environment...

where pnpm >nul 2>nul

if errorlevel 1 (
    echo Error: pnpm is not installed.
    exit /b 1
)

call pnpm dev

if errorlevel 1 (
    echo CG Tourism failed to start.
    exit /b 1
)

endlocal
