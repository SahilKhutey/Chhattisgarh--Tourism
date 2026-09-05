# CG Tourism — Scripts

This directory contains repository-maintenance, development, data-maintenance, verification, and migration utilities.

## Categories

### Data
Scripts that create, validate, transform, seed, or repair tourism data.

### Media
Scripts that inspect, import, validate, or migrate tourism images and other media.

### Repository
Scripts used for repository maintenance and developer tooling.

### Verification
Scripts used to verify data integrity or application assumptions.

## Rules
1. Scripts must be deterministic where possible.
2. Scripts must document required environment variables.
3. Scripts must never contain production secrets.
4. Destructive scripts must require explicit confirmation.
5. Scripts must expose a non-zero exit code on failure.
6. Every production-impacting script must have at least one automated test or validation procedure.
7. New scripts must not be placed in the repository root unless they are required by the package manager or deployment platform.
