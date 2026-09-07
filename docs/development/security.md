# CG Tourism OS — Security, Authentication & RBAC Architecture Guide

This document defines the official security architecture, authentication lifecycle, token rotation mechanics, Role-Based Access Control (RBAC) policies, and error sanitization standards for **CG Tourism OS (`Unseen36Garh`)**.

---

## 1. Security Perimeter Overview

The CG Tourism backend operates behind an layered defense-in-depth architecture:

```
                         INCOMING REQUEST
                                │
                                ▼
                       Reverse Proxy / CDN
                                │
                                ▼
                        NestJS API Gateway
                                │
             ┌──────────────────┼──────────────────┐
             ▼                  ▼                  ▼
        Helmet CSP       ThrottlerGuard      Global Exceptions
      (Security Headers)  (Rate Limiting)   (Stack Trace Mask)
             │                  │                  │
             └──────────────────┼──────────────────┘
                                │
                                ▼
                       Global Validation
                    (Whitelist, Transform)
                                │
                                ▼
                        Authentication
                   (Passport JwtAuthGuard)
                                │
                                ▼
                         Authorization
                     (RolesGuard + @Roles)
                                │
                                ▼
                     Controller Execution
```

---

## 2. Authentication & Token Lifecycle

### A. Access Tokens (Stateless JWT)
- **Algorithm:** HMAC-SHA256 (`HS256`).
- **Secret Requirement:** Strictly validated via Joi schema at startup (`min 32` characters). Insecure hardcoded fallbacks are completely eliminated.
- **Lifetime:** Short-lived (default: `15m`).
- **Payload Contract:**
  ```json
  {
    "sub": "<user-uuid>",
    "email": "traveler@cgtourism.gov.in",
    "role": "USER",
    "iat": 1757234000,
    "exp": 1757234900
  }
  ```

### B. Refresh Tokens (Opaque & Rotated)
- **Token Format:** Opaque random UUIDs / cryptographic entropy tokens stored in PostgreSQL.
- **Rotation:** Every call to `POST /api/v1/auth/refresh` immediately marks the used refresh token as `revoked: true` and issues a completely fresh access + refresh token pair.
- **Revocation:** Calling `POST /api/v1/auth/logout` permanently revokes the submitted refresh token server-side.

---

## 3. Rate Limiting & Abuse Prevention

The system pairs global rate limiting with aggressive, endpoint-specific throttling on sensitive authentication routes via `@nestjs/throttler`:

| Route | Method | Rate Limit | Purpose |
| :--- | :---: | :---: | :--- |
| **Global Default** | Any | 100 req / 60s | General API abuse and scraping protection. |
| `/api/v1/auth/login` | `POST` | **5 req / 60s** | Password guessing / brute-force mitigation. |
| `/api/v1/auth/register` | `POST` | **3 req / 60s** | Automated bot and Sybil account creation defense. |
| `/api/v1/auth/refresh` | `POST` | **10 req / 60s** | Session hijacking and refresh abuse control. |
| `/api/v1/auth/logout` | `POST` | **10 req / 60s** | Session revocation limit. |

---

## 4. Role-Based Access Control (RBAC) Matrix

Access to privileged actions is guarded by `RolesGuard` inspecting `@Roles(...)` metadata against the authenticated user's assigned role:

| Module / Controller | Path Pattern | Required Role | Description |
| :--- | :--- | :---: | :--- |
| **Content Moderation** | `/moderation/pending` | `ADMIN`, `SUPER_ADMIN`, `MODERATOR` | View unverified destinations submitted by creators. |
| **Content Approval** | `/moderation/approve/:id` | `ADMIN`, `SUPER_ADMIN`, `MODERATOR` | Approve pending destinations to appear live. |
| **Role Appointment** | `/moderation/appoint/:userId` | `ADMIN`, `SUPER_ADMIN` | Elevate users to `ADMIN` or `MODERATOR`. |
| **User Directory** | `/moderation/users` | `ADMIN`, `SUPER_ADMIN`, `MODERATOR` | List platform user directory. |
| **Emergency SOS Alerts**| `/moderation/sos/active` | `ADMIN`, `SUPER_ADMIN`, `MODERATOR` | View dispatched emergency SOS distress calls. |
| **Folklore Submission**| `/folklore` (POST) | Authenticated `USER`+ | Submit tribal lore for verification. |
| **Storage / Media Upload**| `/storage/upload`, `/media` | Authenticated `USER`+ | Upload media assets to S3/CDN storage. |
| **Bookings** | `/bookings/*` | Authenticated `USER` | Book destinations and view/cancel own bookings. |
| **Public Exploration** | `/places/*`, `/explore` | Public | Open georeferenced tourism discovery. |

---

## 5. Error Sanitization & Information Leakage Prevention

The system enforces an absolute zero-leakage error policy via [`AllExceptionsFilter`](../../apps/backend/src/common/filters/all-exceptions.filter.ts):

1. **HttpException:** Standard operational errors (e.g., 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found) preserve their HTTP status and message.
2. **Unhandled Exceptions:** Internal server errors (e.g., database disconnections, Prisma constraint errors, syntax errors) are logged server-side via NestJS `Logger.error` along with the complete stack trace.
3. **Client Response:** The external client receives only a sanitized payload:
   ```json
   {
     "statusCode": 500,
     "timestamp": "2026-09-07T09:24:00.000Z",
     "path": "/api/v1/destinations",
     "message": "An unexpected error occurred in the CG Tourism Kernel."
   }
   ```
   Internal stack traces, database credentials, server file paths, and environment secrets are **never** exposed in HTTP responses.

---

## 6. Automated Security Verification Commands

Run the full security test suite:
```bash
# Run all authentication and RBAC tests
pnpm --filter backend test -- auth

# Run exception filter and error sanitization tests
pnpm --filter backend test -- filter

# Run configuration and secret validation tests
pnpm test:config
```
