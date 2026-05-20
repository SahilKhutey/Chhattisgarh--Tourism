# CG Tourism Platform — Phase 2: Core Backend APIs & Databases
## Prisma Schemas, Authentication Controllers, Geospatial Queries & Global Filter Handlers

---

## 1. Complete Production Prisma Schema

Below is the verified, relationally sound **Prisma schema definition** mapping core platform models:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String          @id @default(uuid())
  fullName      String
  email         String          @unique
  password      String
  avatar        String?
  role          UserRole        @default(USER)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  bookmarks     Bookmark[]
  reviews       Review[]
  creatorProfile CreatorProfile?
}

enum UserRole {
  USER
  CREATOR
  ADMIN
  SUPER_ADMIN
}

model Place {
  id              String      @id @default(uuid())
  name            String
  slug            String      @unique
  description     String
  district        String
  categoryId      String

  latitude        Float
  longitude       Float

  heroImage       String
  bestSeason      String?

  history         String?
  safetyInfo      String?
  rules           String?

  verified        Boolean     @default(false)

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  category        Category    @relation(fields: [categoryId], references: [id])
  media           Media[]
  reviews         Review[]
  bookmarks       Bookmark[]
}

model Category {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique

  places    Place[]
}

model Media {
  id          String   @id @default(uuid())
  url         String
  type        MediaType
  placeId     String

  place       Place    @relation(fields: [placeId], references: [id])
}

enum MediaType {
  IMAGE
  VIDEO
}

model Review {
  id          String    @id @default(uuid())
  rating      Int
  comment     String

  userId      String
  placeId     String

  user        User      @relation(fields: [userId], references: [id])
  place       Place     @relation(fields: [placeId], references: [id])

  createdAt   DateTime  @default(now())
}

model Bookmark {
  id          String   @id @default(uuid())

  userId      String
  placeId     String

  user        User     @relation(fields: [userId], references: [id])
  place       Place    @relation(fields: [placeId], references: [id])

  @@unique([userId, placeId])
}

model CreatorProfile {
  id            String   @id @default(uuid())
  userId        String   @unique

  verified      Boolean  @default(false)
  bio           String?
  instagram     String?
  youtube       String?

  user          User     @relation(fields: [userId], references: [id])
}
```

---

## 2. Production Error Handling (Global Exception Filter)

To shield backend database details from malicious exposure while providing structured feedback logs to developers:

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal Server Error';

    // Log the crash internally to facilitate fast troubleshooting
    console.error(`[GlobalException] Status: ${status} | Trace:`, exception);

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      error: typeof message === 'string' ? { message } : message,
    });
  }
}
```

---

## 3. High-Performance PostGIS Geospatial Interface

When executing complex geospatial searches in deep jungle environments (such as looking for campsites within Bastar), direct SQL binding guarantees optimal index retrieval:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GeoService {
  constructor(private readonly prisma: PrismaService) {}

  async findAttractionsWithinRadius(lng: number, lat: number, radiusMeters: number) {
    // Utilize high-speed spatial DWithin spatial querying on coordinate geometries
    return this.prisma.$queryRaw`
      SELECT id, name, district, latitude, longitude,
        ST_Distance(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) as distance_meters
      FROM "Place"
      WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radiusMeters}
      )
      ORDER BY distance_meters ASC;
    `;
  }
}
```

---

## 4. REST API Endpoint Catalog

Our core API gateways expose standard CRUD and secure action contracts:

| Routing Endpoint | Method | Security Level | Purpose | Input / Payload |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/auth/login` | `POST` | Public | Emits secure access tokens. | Email & password credentials |
| `/api/v1/auth/register`| `POST` | Public | Enrolls tourists. | Full name, email, password |
| `/api/v1/places` | `GET` | Public | Fetches paginated places. | Category, slug, district queries |
| `/api/v1/places` | `POST` | Verified Creator | Submits unmapped routes. | Place payload structure |
| `/api/v1/bookmarks` | `POST` | Logged User | Bookmarks destination place. | target place ID |
| `/api/v1/emergency/sos`| `POST` | Active SOS | Emits live SOS beacons. | Location lat/lng coordinates |
