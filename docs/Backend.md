# CG Tourism Platform — Backend Architecture & Engineering Documentation
## Modular Monolith NestJS Structures, Database Models & Background Queues

---

## 1. Backend Philosophy
The **CG Tourism Platform** backend is designed as an **API-first, Modular Monolith** built on **TypeScript and NestJS**. 

Key guidelines include:
- **Strict Module Isolation:** Direct imports across feature domains are prohibited. Communication must happen via clean, injected service providers to enable easy microservice extraction later.
- **Geospatial High Performance:** All spatial searches utilize PostGIS native distance indicators mapped with WGS 84 (`SRID 4326`) coordinate geometry.
- **Reliable Offline Ingress:** Temporary creator contributions and custom offline sync markers are processed using highly scalable transaction pools.

---

## 2. Monorepo Project Structure
Below is the directory design of our backend container folder inside the monorepo workspace:

```
server/
├── src/
│   ├── modules/
│   │   ├── auth/            # JWT authentication & Google OAuth handlers
│   │   ├── users/           # User profiles, saved circuits, and settings
│   │   ├── places/          # PostGIS geospatial tourism data indices
│   │   ├── creators/        # Creator registrations & verification systems
│   │   ├── emergency/       # SOS telemetry queues & regional coordination
│   │   └── moderation/      # Staging backlog review controls
│   ├── common/              # Global decorators, exceptions, and validation filters
│   └── database/            # Prisma client generators & migrations
```

---

## 3. NestJS Architecture Blueprint (Code Skeleton)

To maintain clean separation of concerns, the backend modules are structured using NestJS dependency injections:

### A. Tourism Place Controller (`places.controller.ts`)
```typescript
import { Controller, Get, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PlacesService } from './places.service';

@ApiTags('Places')
@Controller('api/v1/places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get('nearby')
  @ApiOperation({ summary: 'Retrieve destinations within radius of coordinates' })
  @ApiQuery({ name: 'lat', type: Number, required: true })
  @ApiQuery({ name: 'lng', type: Number, required: true })
  @ApiQuery({ name: 'radiusKm', type: Number, required: false })
  async getNearby(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('radiusKm', new DefaultValuePipe(50), ParseFloatPipe) radiusKm: number,
  ) {
    return this.placesService.findNearby(lat, lng, radiusKm);
  }
}
```

### B. Tourism Place Service (`places.service.ts`)
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PlacesService {
  constructor(private readonly prisma: PrismaService) {}

  async findNearby(lat: number, lng: number, radiusKm: number) {
    // Spatial radial search using raw SQL query supported by PostGIS index mapping
    return this.prisma.$queryRaw`
      SELECT 
        id, name, category, tagline, biodiversity_score, rating,
        ST_X(coordinates::geometry) AS longitude,
        ST_Y(coordinates::geometry) AS latitude,
        ST_Distance(
          coordinates, 
          ST_MakePoint(${lng}, ${lat})::geography
        ) / 1000 AS distance_km
      FROM places
      WHERE ST_DWithin(
        coordinates,
        ST_MakePoint(${lng}, ${lat})::geography,
        ${radiusKm * 1000}
      )
      ORDER BY distance_km ASC;
    `;
  }
}
```

---

## 4. Media Processing Pipeline
To handle high-resolution photos and drone video footage submitted by creators without overwhelming cellular speeds in remote zones:
1. **Zod Validation:** Discard uploads exceeding `50MB` for video or `10MB` for imagery.
2. **BullMQ Background Compressing:** Uploads are written to temporary S3 staging vaults. S3 event triggers register a background task in **BullMQ**.
3. **Optimized Rescaling:** Sharp processes image files down to WebP configurations. FFmpeg transcodes raw video into compressed `H.264/MP4` container classes.
4. **CloudFront CDN Distribution:** Optimized assets are written to production public storage cards, invalidating CloudFront edge buffers.
