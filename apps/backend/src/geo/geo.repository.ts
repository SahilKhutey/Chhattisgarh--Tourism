import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NearbyPlace } from './geo.types';

@Injectable()
export class GeoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findNearbyPlaces(
    latitude: number,
    longitude: number,
    radiusMeters: number,
    limit: number,
  ): Promise<NearbyPlace[]> {
    try {
      // Primary: PostGIS ST_DWithin & ST_Distance against verified Place destinations
      const places = await this.prisma.$queryRaw<
        Array<{
          id: string;
          name: string;
          slug: string;
          latitude: number;
          longitude: number;
          distanceMeters: number;
          district: string;
          heroImage: string;
        }>
      >`
        SELECT
          p.id,
          p.name,
          p.slug,
          p.latitude::float8 AS latitude,
          p.longitude::float8 AS longitude,
          p.district,
          p."heroImage",
          ST_Distance(
            ST_SetSRID(ST_MakePoint(p.longitude::float8, p.latitude::float8), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
          ) AS "distanceMeters"
        FROM "Place" p
        WHERE
          (p.verified = true OR p."contentStatus" = 'APPROVED')
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(p.longitude::float8, p.latitude::float8), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            ${radiusMeters}
          )
        ORDER BY "distanceMeters" ASC
        LIMIT ${limit}
      `;

      return places.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
        distanceMeters: Math.round(Number(p.distanceMeters)),
        district: p.district,
        heroImage: p.heroImage,
      }));
    } catch {
      // Fallback Haversine query if PostGIS spatial index is not yet bound
      const allPlaces = await this.prisma.place.findMany({
        where: {
          OR: [{ verified: true }, { contentStatus: 'APPROVED' }],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          latitude: true,
          longitude: true,
          district: true,
          heroImage: true,
        },
      });

      const R = 6_371_008.8;
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const lat1 = toRad(latitude);

      const calculated = allPlaces.map((p) => {
        const lat2 = toRad(p.latitude);
        const dLat = toRad(p.latitude - latitude);
        const dLng = toRad(p.longitude - longitude);

        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
        const distanceMeters = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          latitude: p.latitude,
          longitude: p.longitude,
          distanceMeters: Math.round(distanceMeters),
          district: p.district,
          heroImage: p.heroImage,
        };
      });

      return calculated
        .filter((p) => p.distanceMeters <= radiusMeters)
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, limit);
    }
  }

  async findPlacesInBounds(
    north: number,
    south: number,
    east: number,
    west: number,
    limit: number,
  ): Promise<
    Array<{
      id: string;
      name: string;
      slug: string;
      latitude: number;
      longitude: number;
      district: string;
      heroImage: string;
    }>
  > {
    const places = await this.prisma.place.findMany({
      where: {
        AND: [
          { latitude: { gte: south, lte: north } },
          { longitude: { gte: west, lte: east } },
          { OR: [{ verified: true }, { contentStatus: 'APPROVED' }] },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        latitude: true,
        longitude: true,
        district: true,
        heroImage: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    return places;
  }

  async findDivisions() {
    return this.prisma.division.findMany({
      where: { status: 'ACTIVE' },
      include: {
        _count: {
          select: { districts: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findDistricts(divisionId?: string) {
    return this.prisma.district.findMany({
      where: {
        status: 'ACTIVE',
        ...(divisionId ? { divisionId } : {}),
      },
      include: {
        division: { select: { id: true, name: true, slug: true } },
        _count: {
          select: { zones: true, places: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findDistrictByIdOrSlug(idOrSlug: string) {
    return this.prisma.district.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug.toLowerCase() }],
        status: 'ACTIVE',
      },
      include: {
        division: true,
        zones: true,
        places: {
          where: { verified: true },
          take: 20,
        },
      },
    });
  }

  async findZonesByDistrict(districtId: string) {
    return this.prisma.touristZone.findMany({
      where: {
        status: 'ACTIVE',
        OR: [{ districtId }, { district: { slug: districtId.toLowerCase() } }],
      },
      include: {
        _count: { select: { places: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findPlacesByZone(zoneId: string) {
    return this.prisma.place.findMany({
      where: {
        OR: [{ touristZoneId: zoneId }, { touristZone: { slug: zoneId.toLowerCase() } }],
        verified: true,
      },
      include: {
        category: true,
        media: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
