import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { DiscoveryCandidate } from '../ranking/ranking.types';

@Injectable()
export class SearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async search(params: {
    query?: string;
    district?: string;
    zone?: string;
    category?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    limit?: number;
    offset?: number;
  }): Promise<DiscoveryCandidate[]> {
    const search = params.query?.trim() || null;
    const district = params.district?.trim() || null;
    const zone = params.zone?.trim() || null;
    const category = params.category?.trim() || null;
    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;
    const hasCoords = params.latitude !== undefined && params.longitude !== undefined;
    const lat = params.latitude ?? 0;
    const lng = params.longitude ?? 0;
    const radius = params.radius ?? 200000;

    let results: any[];

    if (hasCoords) {
      results = await this.prisma.$queryRaw`
        SELECT DISTINCT
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
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          ) AS "distanceMeters"
        FROM "Place" p
        LEFT JOIN "District" d ON d.id = p."districtRelId"
        LEFT JOIN "TouristZone" z ON z.id = p."touristZoneId"
        LEFT JOIN "PlaceCategory" pc ON pc."placeId" = p.id
        LEFT JOIN "Category" c ON c.id = pc."categoryId" OR c.id = p."categoryId"
        WHERE
          p.status = 'PUBLISHED'
          AND p.visibility = 'PUBLIC'
          AND (
            ${search}::text IS NULL
            OR p.name ILIKE '%' || ${search} || '%'
            OR p.slug ILIKE '%' || ${search} || '%'
            OR p."shortDescription" ILIKE '%' || ${search} || '%'
          )
          AND (
            ${district}::text IS NULL
            OR d.slug = ${district}
            OR d.name ILIKE ${district}
          )
          AND (
            ${zone}::text IS NULL
            OR z.slug = ${zone}
            OR z.name ILIKE ${zone}
          )
          AND (
            ${category}::text IS NULL
            OR c.slug = ${category}
            OR c.name ILIKE ${category}
          )
          AND ST_DWithin(
            COALESCE(p.location, ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography),
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
            ${radius}
          )
        ORDER BY "distanceMeters" ASC
        LIMIT ${limit}
        OFFSET ${offset};
      `;
    } else {
      results = await this.prisma.$queryRaw`
        SELECT DISTINCT
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
          z.slug AS "zoneSlug"
        FROM "Place" p
        LEFT JOIN "District" d ON d.id = p."districtRelId"
        LEFT JOIN "TouristZone" z ON z.id = p."touristZoneId"
        LEFT JOIN "PlaceCategory" pc ON pc."placeId" = p.id
        LEFT JOIN "Category" c ON c.id = pc."categoryId" OR c.id = p."categoryId"
        WHERE
          p.status = 'PUBLISHED'
          AND p.visibility = 'PUBLIC'
          AND (
            ${search}::text IS NULL
            OR p.name ILIKE '%' || ${search} || '%'
            OR p.slug ILIKE '%' || ${search} || '%'
            OR p."shortDescription" ILIKE '%' || ${search} || '%'
          )
          AND (
            ${district}::text IS NULL
            OR d.slug = ${district}
            OR d.name ILIKE ${district}
          )
          AND (
            ${zone}::text IS NULL
            OR z.slug = ${zone}
            OR z.name ILIKE ${zone}
          )
          AND (
            ${category}::text IS NULL
            OR c.slug = ${category}
            OR c.name ILIKE ${category}
          )
        ORDER BY p.name ASC
        LIMIT ${limit}
        OFFSET ${offset};
      `;
    }

    return results.map((row) => ({
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
      distanceMeters: row.distanceMeters !== undefined ? Number(row.distanceMeters) : undefined,
    }));
  }
}
