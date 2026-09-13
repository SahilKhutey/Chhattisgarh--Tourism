import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';

@Injectable()
export class GeoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async nearby(
    latitude: number,
    longitude: number,
    radius: number = 10000,
    limit: number = 50,
  ) {
    if (latitude < -90 || latitude > 90) {
      throw new BadRequestException('Invalid latitude');
    }
    if (longitude < -180 || longitude > 180) {
      throw new BadRequestException('Invalid longitude');
    }
    if (radius <= 0 || radius > 200000) {
      throw new BadRequestException('Radius must be between 100 and 200000 meters');
    }

    const roundedLat = Number(latitude.toFixed(4));
    const roundedLng = Number(longitude.toFixed(4));
    const cacheKey = `discovery:nearby:${roundedLat}:${roundedLng}:${radius}:${limit}`;

    const cached = await this.redis.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const results: any[] = await this.prisma.$queryRaw`
      SELECT
        p.id,
        p.name,
        p.slug,
        p."shortDescription",
        p.latitude,
        p.longitude,
        p."altitudeMeters",
        p."heroImage",
        d.name AS "districtName",
        d.slug AS "districtSlug",
        z.name AS "zoneName",
        z.slug AS "zoneSlug",
        ST_Distance(
          COALESCE(p.location, ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography),
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        ) AS "distanceMeters"
      FROM "Place" p
      LEFT JOIN "District" d ON d.id = p."districtRelId"
      LEFT JOIN "TouristZone" z ON z.id = p."touristZoneId"
      WHERE
        p.status = 'PUBLISHED'
        AND p.visibility = 'PUBLIC'
        AND ST_DWithin(
          COALESCE(p.location, ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography),
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${radius}
        )
      ORDER BY "distanceMeters" ASC
      LIMIT ${limit};
    `;

    const mapped = results.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      shortDescription: row.shortDescription,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      altitudeMeters: row.altitudeMeters ? Number(row.altitudeMeters) : null,
      heroImage: row.heroImage,
      district: row.districtName,
      districtSlug: row.districtSlug,
      zone: row.zoneName,
      zoneSlug: row.zoneSlug,
      distanceMeters: Math.round(Number(row.distanceMeters)),
    }));

    await this.redis.set(cacheKey, mapped, 180); // 3 minutes TTL

    return mapped;
  }

  async mapViewport(
    north: number,
    south: number,
    east: number,
    west: number,
    zoom: number = 8,
    category?: string,
    limit: number = 200,
  ) {
    if (south > north || west > east) {
      throw new BadRequestException('Invalid viewport coordinates');
    }

    const cat = category?.trim() || null;
    const cacheKey = `discovery:map:${north.toFixed(2)}:${south.toFixed(2)}:${east.toFixed(2)}:${west.toFixed(2)}:${zoom}:${cat || 'all'}`;

    const cached = await this.redis.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const results: any[] = await this.prisma.$queryRaw`
      SELECT DISTINCT
        p.id,
        p.name,
        p.slug,
        p.latitude,
        p.longitude,
        p."shortDescription",
        p."heroImage",
        d.name AS "districtName",
        d.slug AS "districtSlug",
        c.name AS "categoryName",
        c.slug AS "categorySlug"
      FROM "Place" p
      LEFT JOIN "District" d ON d.id = p."districtRelId"
      LEFT JOIN "PlaceCategory" pc ON pc."placeId" = p.id
      LEFT JOIN "Category" c ON c.id = pc."categoryId" OR c.id = p."categoryId"
      WHERE
        p.status = 'PUBLISHED'
        AND p.visibility = 'PUBLIC'
        AND p.latitude BETWEEN ${south} AND ${north}
        AND p.longitude BETWEEN ${west} AND ${east}
        AND (
          ${cat}::text IS NULL
          OR c.slug = ${cat}
          OR c.name ILIKE ${cat}
        )
      ORDER BY p.name ASC
      LIMIT ${limit};
    `;

    const mapped = results.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      shortDescription: row.shortDescription,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      heroImage: row.heroImage,
      district: row.districtName,
      districtSlug: row.districtSlug,
      category: row.categoryName,
      categorySlug: row.categorySlug,
    }));

    await this.redis.set(cacheKey, mapped, 120); // 2 minutes TTL

    return mapped;
  }
}
