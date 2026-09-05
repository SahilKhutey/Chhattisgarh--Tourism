# CG Tourism Development Guide

## Prerequisites

Install:
- Git
- Node.js (v20+)
- pnpm (v9.14.0+)

The repository defines the supported package-manager version through `package.json`.

## Clone
```bash
git clone https://github.com/SahilKhutey/Chhattisgarh--Tourism.git
cd Chhattisgarh--Tourism
```

## Install
```bash
corepack enable
pnpm install
```

## Development
```bash
pnpm dev
```

Alternatively, use the cross-platform startup scripts:
- **Windows:** `scripts\dev.bat` (or `Launch-CG-Tourism.bat`)
- **Unix / macOS:** `./scripts/dev.sh`

## Validation
```bash
pnpm repo:check
pnpm lint
pnpm test
pnpm build
```

## Branching Architecture

- **Production:** `main`
- **Integration:** `develop`
- **Feature development:** `feature/<description>`

Examples:
- `feature/district-map`
- `feature/itinerary-engine`
- `feature/tourism-content`

## Pull Request Lifecycle

All changes should enter `main` through a Pull Request.

A feature should normally follow:
```
feature/*
    ↓
 develop
    ↓
  main
```

## Commit Format

Standardize commits using Conventional Commits:

- `feat:` A new user-facing feature
- `fix:` A bug fix
- `docs:` Documentation changes only
- `refactor:` Code refactoring without behavioral alterations
- `test:` Adding or updating tests
- `chore:` Maintenance, dependency, and repo configuration tasks
- `ci:` Continuous integration and workflow changes
- `build:` Build system and tooling modifications
- `perf:` Performance improvements
- `style:` Formatting / white-space changes
- `revert:` Reverting a previous commit

Examples:
- `feat(map): add district map layer`
- `fix(auth): validate refresh token`
- `test(planner): add itinerary scoring tests`
- `docs(dev): update setup instructions`
- `chore(repo): reorganize maintenance scripts`

## Secrets & Artifact Protection

Never commit:
- `.env`, `.env.*` (except `.env.example`)
- API keys, private keys, service tokens, or passwords
- Test artifacts (`playwright-report/`, `test-results/`)
- Database files (`*.db`, `*.sqlite`, `*.sqlite3`)

Use `.env.example` for documented environment variable templates only.
