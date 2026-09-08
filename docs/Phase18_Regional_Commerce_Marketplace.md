# Phase 18 — Regional Commerce, Partner Network & Tourism Marketplace

## 1. Architectural Overview
Phase 18 extends the **CG Tourism OS** from an informational and navigational directory into a fully transactional **Regional Tourism Economy**. It connects verified indigenous supply (tribal homestays, native cultural guides, certified craft tours, eco-transport operators, and local festivals) directly with consumer discovery, transparent capacity management, and transactional bookings.

```
                       CG TOURISM OS
                             │
     ┌───────────────────────┼────────────────────────┐
     │                       │                        │
Consumer Marketplace    Partner Network          Admin Operations
  - /experiences         - /partner               - /admin/marketplace
  - Real-time Slots      - Direct Verification    - Commission Ledger
  - Anti-Overselling     - 90% Net Payout         - Dispute Review
  - Policy Refunds       - Inventory Management   - Partner Approvals
```

---

## 2. Core Invariants & Engineering Principles

### 2.1 Server-Enforced Anti-Overselling
- Inventory capacity cannot be oversold under concurrent traffic.
- Every reservation uses atomic transaction locks:
  `tx.productAvailability.update({ where: { id }, data: { reserved: { increment: quantity } } })`
- Cancellation atomically decrements reserved seats:
  `tx.productAvailability.update({ where: { id }, data: { reserved: { decrement: quantity } } })`

### 2.2 Transparent Fixed-Rate Commission
- No opaque algorithmic pricing.
- Platform fee: 10.0% fixed rate.
- Formula:
  - `commissionAmount = grossAmount * 0.10`
  - `partnerAmount = grossAmount - commissionAmount`

### 2.3 Transparent Cancellation & Refund Policy
- Every product attaches a `CancellationPolicy`:
  - **Full Refund**: If cancelled `>= fullRefundHours` (default: 48h) before slot start.
  - **Partial Refund**: If cancelled between `partialRefundHours` (default: 24h) and `fullRefundHours` (default: 48h) at `partialRefundPercent` (default: 50%).
  - **No Refund**: If cancelled `< partialRefundHours` before slot start.

### 2.4 State Machine & Idempotency
- Booking states: `PENDING -> CONFIRMED -> COMPLETED / CANCELLED`
- Payment states: `UNPAID -> AUTHORIZED -> PAID -> REFUND_PENDING -> REFUNDED / FAILED`
- Payment intents enforce unique `IdempotencyKey` records to protect against duplicate charge submissions.

---

## 3. Database Schema Models (Prisma)
- `Partner`: Regional trade entity, verification status (`PENDING`, `UNDER_REVIEW`, `VERIFIED`, `SUSPENDED`, `REJECTED`), district location, and contact metadata.
- `TourismProduct`: Inventory listing categorized as `HOMESTAY`, `GUIDE`, `EXPERIENCE`, `EVENT`, `TRANSPORT`, `ACTIVITY`.
- `ProductAvailability`: Time slot with start/end timestamps, total capacity, and atomically tracked reserved seats.
- `PartnerCommission`: Detailed settlement record linking `grossAmount`, `commissionRate`, `commissionAmount`, and net `partnerAmount`.
- `CancellationPolicy`: Refund parameters attached to products.
- `ProductReview`: Verified-purchase review restricted to users with completed bookings.
- `CommerceAuditLog`: Immutable audit trail recording state changes and operator actions.
- `IdempotencyKey`: Cached responses for safe payment retry.

---

## 4. REST API Reference

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/v1/marketplace/products` | GET | Public | Search and filter active verified tourism products |
| `/api/v1/marketplace/products/slug/:slug` | GET | Public | Get product details, upcoming slot availability, policy |
| `/api/v1/marketplace/products/:id/availability` | GET | Public | Get upcoming availability calendar & seat balance |
| `/api/v1/marketplace/products` | POST | Partner/Admin | Create draft product |
| `/api/v1/marketplace/products/:id/activate` | PATCH | Partner/Admin | Activate product (requires verified partner) |
| `/api/v1/marketplace/products/:id/availability` | POST | Partner/Admin | Add inventory slot |
| `/api/v1/partners` | POST | Public | Apply for partner registration |
| `/api/v1/partners` | GET | Public/Admin | List and filter partners |
| `/api/v1/partners/slug/:slug` | GET | Public | Get verified partner public profile |
| `/api/v1/partners/:id/verify` | PATCH | Admin | Approve or reject partner application |
| `/api/v1/partners/:id/suspend` | PATCH | Admin | Suspend partner |
| `/api/v1/partners/:id/stats` | GET | Partner/Admin | Get partner GMV, booking count, active listings |
| `/api/v1/bookings/marketplace` | POST | User | Atomic product booking with capacity reservation |
| `/api/v1/payments/create` | POST | User | Create payment intent with idempotency protection |
| `/api/v1/payments/webhook` | POST | Gateway | Webhook event ingestion |
| `/api/v1/refunds/quote/:bookingId` | GET | User | Get dynamic refund calculation |
| `/api/v1/refunds/process` | POST | User | Process cancellation & refund |
| `/api/v1/commerce/settlements/partner/:id` | GET | Partner/Admin | View settlement balance and ledger |
| `/api/v1/commerce/commissions` | GET | Admin | Platform-wide commission audit |

---

## 5. Automated Verification Suites
- **Backend Unit Tests**: 52 test suites, 308 unit tests covering commission math, capacity bounding, partner verification, transactional booking rollback, and refund tier calculations.
- **Backend E2E Tests**: 2 test suites, 8 tests verifying health and translation workflows.
- **Web Unit Tests**: 17 test suites, 86 tests verifying client context and component behavior.
- **Mobile Vitest Tests**: 2 test suites, 9 tests for Capacitor mobile runtime.
- **Playwright E2E Tests**: 50 tests across Chromium and Mobile Chrome verifying marketplace discovery, booking reservation dialog, partner portal, and admin marketplace operations.
