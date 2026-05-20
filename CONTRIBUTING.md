# Contributing to CG Tourism OS

Thank you for investing your engineering capabilities into the CG Tourism OS platform. To maintain our strict **Zero-Error Build State** and professional ecosystem, please strictly adhere to the following guidelines.

## 1. Branching Strategy

We follow a structured branching system to protect the `main` branch.

- `main`: The production-ready, zero-error state branch. Direct commits are forbidden.
- `staging`: The pre-production branch where features are integrated and tested.
- `feature/<ticket-or-name>`: Use for building new features.
- `hotfix/<ticket-or-name>`: Use for urgent production patches.

## 2. Commit Standards

Use Conventional Commits for semantic versioning and clear history:

- `feat:` A new feature or subsystem.
- `fix:` A bug fix.
- `refactor:` Code changes that neither fix a bug nor add a feature.
- `docs:` Documentation updates.
- `chore:` Maintenance tasks (e.g., dependency updates).

*Example:* `feat(admin): implement hierarchical role elevation system`

## 3. Pull Request Protocol

When submitting a Pull Request (PR) to `staging` or `main`:
1. **Zero-Error Validation:** Ensure `pnpm run lint` and `pnpm run build` pass completely locally.
2. **Type Safety:** No generic `any` types. All variables and responses must map to strict TypeScript interfaces.
3. **No Console Logs:** Remove all arbitrary `console.log` statements. Use the dedicated centralized logging service for the backend.
4. **Peer Review:** PRs require at least one senior engineer or architect approval before merging.

## 4. Code Quality & Formatting

- We use Prettier for code formatting. Run `pnpm run format` before staging files.
- We use ESLint for static analysis. Do not bypass rules using `// eslint-disable-next-line` unless explicitly approved by the Lead Architect with documented justification.

## 5. Security Protocols

- **Never** commit `.env` files or hardcode secrets into the source code.
- Ensure all API endpoints utilize the centralized global validation pipelines and authorization guards.
- Respect the `Throttler` configurations to prevent Denial of Service vectors.

By adhering to these rules, we ensure the platform remains scalable, secure, and commercially viable.
