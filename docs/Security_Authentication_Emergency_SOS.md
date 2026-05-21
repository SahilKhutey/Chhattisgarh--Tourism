# CG Tourism Platform — Security, Authentication & Emergency SOS Subsystem Documentation

This document details the architecture, data models, security implementation, and API specifications for the authentication, role-based access control (RBAC), and emergency SOS dispatch systems implemented in Phase 2 of the CG Tourism platform.

---

## 1. Authentication & Security Architecture

The platform uses a double-token (JWT + Opaque Refresh Token) security system to balance performance, security, and offline resilience.

### JWT Access Tokens (Short-Lived)
- **Role:** Authorization for all API endpoints.
- **Expiry:** 15 minutes.
- **Signature:** Signed via HS256 using the server-side environment key `JWT_SECRET`.
- **Payload Structure:**
  ```json
  {
    "sub": "user-uuid-string",
    "email": "traveler@cg.gov.in",
    "role": "USER" | "CREATOR" | "ADMIN" | "RANGER"
  }
  ```

### Opaque Refresh Tokens (Long-Lived & Rotate-on-Use)
- **Role:** Securely requesting a new Access Token without re-authenticating with passwords.
- **Expiry:** 30 days.
- **Format:** High-entropy random UUID (v4) generated via Node's native `crypto.randomUUID()`.
- **Storage:** Persisted in the database. Opaque format ensures that even if intercepted, it does not leak user details.
- **Token Rotation (Security against Replay Attacks):** Whenever a refresh token is presented to `/api/v1/auth/refresh`, it is immediately marked as `revoked: true`, and a new pair (access + refresh) is generated. This mitigates replay attacks if a refresh token is stolen.

### Prisma Schema Definition (`PrismaService` + SQLite)
```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  password      String
  fullName      String
  role          String         @default("USER") // USER, CREATOR, ADMIN, RANGER
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  reviews       Review[]
  bookmarks     Bookmark[]
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  revoked   Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## 2. Role-Based Access Control (RBAC)

Access permissions are enforced programmatically using NestJS Guards and custom decorators.

### Custom Roles Decorator (`@Roles`)
The custom decorator `@Roles(...string[])` metadata tag is placed on controller routes to define the required roles for execution:
```typescript
import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

### Roles Guard (`RolesGuard`)
The `RolesGuard` intersects requests, extracts the user's role from the validated JWT payload (injected by `JwtAuthGuard`), and checks if it matches the route's metadata requirements:
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user?.role);
  }
}
```

---

## 3. Emergency SOS & Radial Dispatch Engine

The SOS system handles immediate safety alerts in remote forest areas (like Bastar or Kanger Valley) and dispatches alerts to the nearest responders based on real-time GPS telemetry.

### Technical Distance Calculation (Haversine Formula)
To ensure the calculations are accurate across the earth's curvature without relying on active network GIS engines (such as Mapbox/PostGIS) which may fail offline, the backend implements a local mathematical fallback utilizing the **Haversine Formula**:

$$\Delta\text{lat} = \text{lat}_2 - \text{lat}_1$$
$$\Delta\text{lon} = \text{lon}_2 - \text{lon}_1$$
$$a = \sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1) \cdot \cos(\text{lat}_2) \cdot \sin^2\left(\frac{\Delta\text{lon}}{2}\right)$$
$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$
$$d = R \cdot c$$

*Where $R = 6371\text{ km}$ (Earth's radius) and coordinates are in radians.*

### Regional Responders Registry
Responders are registered across regional divisions of Chhattisgarh:
- **Bastar:** Forest Ranger Headquarters, Jagdalpur Medical College, Police Control Room, Chitrakote Range Office.
- **Kabirdham:** Kawardha PCR Station, Kawardha Health Centre.
- **Surguja:** Surguja Civil Rescue Camp, Ambikapur District Hospital.
- **Raipur:** Raipur State Emergency Operations, Dr. BR Ambedkar State Hospital.

### Dispatching Logic
1. User fires `/api/v1/emergency/sos` with GPS `latitude`, `longitude`, `touristName`, `touristPhone`, and optional `medicalNotes`.
2. The engine computes the great-circle distance between the user and all registered responders in Chhattisgarh.
3. It sorts all stations by proximity.
4. The nearest responder is selected as the **Primary Responder** (dispatched immediately).
5. The next 3 nearest responders are selected as **Backup Responders** (alerted in parallel).
6. The SOS event is persisted in the database for tracking, response auditing, and resolution:
```prisma
model EmergencyAlert {
  id               String    @id @default(uuid())
  alertId          String    @unique
  touristName      String
  touristPhone     String?
  medicalNotes     String?
  latitude         Float
  longitude        Float
  status           String    @default("DISPATCHED") // DISPATCHED, RESPONDING, RESOLVED
  primaryResponder String
  createdAt        DateTime  @default(now())
  resolvedAt       DateTime?
}
```

---

## 4. Moderation & Creator Verification Backlog

Designed to process community submissions and maintain content quality for the Chhattisgarh travel platform.

### Creator Verification
- Users request creator status.
- State Admins review the backlog in `/admin`.
- Approving a creator updates their role to `CREATOR`, granting them access to publish wilderness places and tribal folklore.

### Content Moderation Flow
- Creators submit places or stories.
- The items enter a pending verification state.
- Administrators review details, verify coordinates, and approve/reject the submissions, immediately updating the public GIS layers.
