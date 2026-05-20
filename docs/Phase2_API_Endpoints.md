# CG Tourism Platform — Phase 2: API Endpoints & Backend Architecture

## NestJS Modular Monolith REST API Reference

---

## Overview

The backend runs as a **NestJS Modular Monolith** exposed on `http://localhost:4000/api/v1` in development.
All routes are documented interactively at `http://localhost:4000/docs` via **Swagger UI**.

---

## 1. Authentication Module — `/api/v1/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register a new tourist / contributor profile | ❌ |
| `POST` | `/auth/login` | Login and receive JWT access token | ❌ |

### POST `/auth/register`
```json
{
  "fullName": "Anjali Verma",
  "email": "anjali@cgtourism.in",
  "password": "SecurePass@123",
  "role": "TOURIST"
}
```

### POST `/auth/login`
```json
{ "email": "anjali@cgtourism.in", "password": "SecurePass@123" }
```
**Returns:** `{ "accessToken": "eyJhbGci..." }`

---

## 2. Places Module — `/api/v1/places`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/places` | List all verified tourist destinations | ❌ |
| `GET`  | `/places?category=<slug>&district=<name>` | Filter by category / district | ❌ |
| `GET`  | `/places/:slug` | Fetch a single destination by slug ID | ❌ |
| `GET`  | `/places/nearby?lat=<>&lng=<>&radiusKm=<>` | Find destinations within a radius (PostGIS) | ❌ |
| `POST` | `/places` | Submit a new creator-contributed place (pending moderation) | ✅ JWT |

### GET `/places` — Response Sample
```json
[
  {
    "id": "clxyz123",
    "slug": "chitrakote-falls",
    "name": "Chitrakote Waterfalls",
    "description": "The Niagara of India — a 300m wide horseshoe waterfall on the Indravati River.",
    "district": "Bastar",
    "heroImage": "https://...",
    "latitude": 19.1081,
    "longitude": 81.7095,
    "verified": true,
    "category": { "name": "Waterfalls", "slug": "waterfalls" }
  }
]
```

---

## 3. Reviews Module — `/api/v1/reviews`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/reviews` | Submit a traveler feedback review | ✅ `x-user-id` header |
| `GET`  | `/reviews/place/:placeId` | Retrieve all reviews for a destination | ❌ |

### POST `/reviews`
```json
{
  "placeId": "clxyz123",
  "rating": 4.8,
  "comment": "Breathtaking at sunrise — highly recommend the viewpoint at the gorge edge."
}
```
> **Header:** `x-user-id: <userId>`

---

## 4. Bookmarks Module — `/api/v1/bookmarks`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/bookmarks` | Bookmark a destination to user's saved list | ✅ `x-user-id` |
| `GET`  | `/bookmarks` | Retrieve all bookmarks for a user | ✅ `x-user-id` |
| `DELETE` | `/bookmarks/:placeId` | Remove a bookmark | ✅ `x-user-id` |

---

## 5. Users Module — `/api/v1/users`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/users/profile` | Fetch the authenticated user's profile | ✅ JWT |
| `PATCH` | `/users/profile` | Update name, avatar, bio | ✅ JWT |
| `POST` | `/users/register-creator` | Apply for creator contributor status | ✅ JWT |

---

## 6. Moderation Module — `/api/v1/moderation` _(Admin Only)_

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/moderation/pending` | Fetch all places pending admin review | ✅ ADMIN role |
| `PATCH` | `/moderation/:id/approve` | Approve a creator-contributed place | ✅ ADMIN role |
| `DELETE` | `/moderation/:id/reject` | Reject and archive a submission | ✅ ADMIN role |

---

## 7. Emergency Module — `/api/v1/emergency`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/emergency/sos` | Broadcast SOS alert with GPS coordinates | ❌ |
| `GET`  | `/emergency/helplines` | List emergency contacts (optionally by district) | ❌ |
| `GET`  | `/emergency/helplines?district=Bastar` | Filter contacts to a specific district | ❌ |

### POST `/emergency/sos`
```json
{
  "latitude": 19.1081,
  "longitude": 81.7095,
  "distressType": "MEDICAL",
  "touristName": "Rajesh Kumar",
  "message": "Sprained ankle on Tirathgarh trail, unable to walk."
}
```
**Returns:** Nearest rescue station dispatch confirmation with ETA.

---

## 8. Environment Variables

Create `apps/backend/.env` from this template:

```env
# PostgreSQL / PostGIS database
DATABASE_URL="postgresql://postgres:secure_postgres_password@localhost:5432/cgtourism"

# JWT security secret
JWT_SECRET="cg_tourism_jwt_secret_key_2026_bastar"
JWT_EXPIRES_IN="7d"

# Server port
PORT=4000

# CORS: comma-separated allowed frontend origins
CORS_ALLOWED_ORIGINS="http://localhost:3000"

# Redis cache & queues
REDIS_URL="redis://localhost:6379"
```

---

## 9. Database Setup

```bash
# 1. Start Docker containers (PostgreSQL + Redis)
docker compose up -d

# 2. Apply schema migrations
pnpm --filter backend exec prisma migrate dev --name init

# 3. Seed sample data
pnpm --filter backend exec ts-node prisma/seed.ts

# 4. Verify schema in Prisma Studio
pnpm --filter backend exec prisma studio
```

---

## 10. Swagger API Explorer

Once the backend is running:

> **URL:** [http://localhost:4000/docs](http://localhost:4000/docs)

All endpoints, request schemas, and response models are interactively documented here with try-it-out execution capability.
