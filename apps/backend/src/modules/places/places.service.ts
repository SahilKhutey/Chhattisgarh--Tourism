import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';

@Injectable()
export class PlacesService {
  constructor(private readonly prisma: PrismaService) {}

  private createSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private validateCoordinates(latitude: number, longitude: number): void {
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      throw new BadRequestException('Invalid latitude.');
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw new BadRequestException('Invalid longitude.');
    }
  }

  async create(dto: CreatePlaceDto, ownerId?: string) {
    this.validateCoordinates(dto.latitude, dto.longitude);

    const slug = this.createSlug(dto.name);

    if (!slug) {
      throw new BadRequestException(
        'Unable to generate a valid destination slug.',
      );
    }

    const exists = await this.prisma.place.findUnique({
      where: { slug },
    });

    if (exists) {
      throw new BadRequestException(
        `Destination with matching slug '${slug}' already exists.`,
      );
    }

    const place = await this.prisma.place.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description.trim(),
        district: dto.district.trim(),
        categoryId: dto.categoryId,
        latitude: dto.latitude,
        longitude: dto.longitude,

        heroImage: dto.heroImage ?? '',

        bestSeason: dto.bestSeason?.trim() || null,
        history: dto.history?.trim() || null,
        safetyInfo: dto.safetyInfo?.trim() || null,
        rules: dto.rules?.trim() || null,
        audioUrl: dto.audioUrl || null,
        audioNarrator: dto.audioNarrator || null,

        highlights: JSON.stringify(dto.highlights || []),
        experienceTypes: JSON.stringify(dto.experienceTypes || []),
        platformFeatures: JSON.stringify(dto.platformFeatures || []),

        verified: false,
        verificationLevel: 'UNVERIFIED',
        contentStatus: 'PENDING_REVIEW',

        sourceType: dto.sourceType || 'INTERNAL',
        sourceName: dto.sourceName?.trim() || null,
        sourceUrl: dto.sourceUrl || null,

        contentOwnerId: ownerId || null,
      },
      include: {
        category: true,
        media: true,
      },
    });

    return this.formatPlace(place);
  }

  async findAll(categorySlug?: string, district?: string, search?: string) {
    const where: any = {
      verified: true,
      contentStatus: 'APPROVED',
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(district && district !== 'All' ? { district: { equals: district, mode: 'insensitive' } } : {}),
    };

    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
      ];
    }

    const places = await this.prisma.place.findMany({
      where,
      include: {
        category: true,
        media: {
          where: { status: 'APPROVED' },
          orderBy: { uploadedAt: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return places.map((place) => this.formatPlace(place));
  }

  async getCategories() {
    const categories = await this.prisma.category.findMany({
      include: {
        _count: {
          select: { places: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      placeCount: c._count.places,
    }));
  }

  async getDistricts() {
    const grouped = await this.prisma.place.groupBy({
      by: ['district'],
      where: { verified: true },
      _count: { id: true },
      orderBy: { district: 'asc' },
    });

    return grouped
      .filter((g) => g.district && g.district.trim() !== '' && g.district !== 'Unknown')
      .map((g) => ({
        name: g.district,
        placeCount: g._count.id,
      }));
  }

  async findBySlug(slug: string) {
    const place = await this.prisma.place.findUnique({
      where: { slug },
      include: {
        category: true,
        media: {
          where: { status: 'APPROVED' },
          orderBy: { uploadedAt: 'desc' },
        },
        weather: true,
        transport: true,
        metadata: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        verificationHistory: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            reviewer: {
              select: {
                id: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!place) {
      throw new NotFoundException(`Destination with slug '${slug}' not found.`);
    }

    return this.formatPlace(place);
  }

  async findById(id: string) {
    const place = await this.prisma.place.findUnique({
      where: { id },
      include: {
        category: true,
        media: true,
        verificationHistory: {
          orderBy: { createdAt: 'desc' },
          include: {
            reviewer: {
              select: {
                id: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!place) {
      throw new NotFoundException('Place not found.');
    }

    return this.formatPlace(place);
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async findNearby(lat: number, lng: number, radiusKm: number) {
    this.validateCoordinates(lat, lng);

    if (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 1000) {
      throw new BadRequestException(
        'radiusKm must be greater than 0 and no more than 1000.',
      );
    }

    try {
      const places: any[] = await this.prisma.$queryRaw`
        SELECT
          p.id,
          p.name,
          p.slug,
          p.description,
          p.district,
          p."heroImage",
          p."bestSeason",
          p.latitude,
          p.longitude,
          ST_Distance(
            ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          ) / 1000 AS distance_km
        FROM "Place" p
        WHERE p.verified = true
          AND p."contentStatus" = 'APPROVED'
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
            ${radiusKm * 1000}
          )
        ORDER BY distance_km ASC;
      `;

      return places.map((place) => this.formatPlace(place));
    } catch {
      const allPlaces = await this.prisma.place.findMany({
        where: {
          verified: true,
          contentStatus: 'APPROVED',
        },
        include: {
          category: true,
          media: true,
        },
      });

      return allPlaces
        .map((place) => ({
          ...place,
          distance_km: this.calculateDistance(
            lat,
            lng,
            place.latitude,
            place.longitude,
          ),
        }))
        .filter((place) => place.distance_km <= radiusKm)
        .sort((a, b) => a.distance_km - b.distance_km)
        .map((place) => this.formatPlace(place));
    }
  }

  async semanticSearch(query: string, limit = 5) {
    if (!query?.trim()) {
      return [];
    }

    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const places = await this.prisma.place.findMany({
      where: {
        verified: true,
        contentStatus: 'APPROVED',
      },
      include: {
        category: true,
        media: true,
      },
    });

    const searchTerms = query
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter((term) => term.length > 2);

    const results = places.map((place) => {
      let score = 0;
      const name = place.name.toLowerCase();
      const description = place.description.toLowerCase();
      const district = place.district.toLowerCase();
      const history = (place.history || '').toLowerCase();
      const season = (place.bestSeason || '').toLowerCase();
      const category = place.category?.name?.toLowerCase() || '';

      for (const term of searchTerms) {
        if (name.includes(term)) score += 5;
        if (category.includes(term)) score += 4;
        if (district.includes(term)) score += 3;
        if (description.includes(term)) score += 1.5;
        if (history.includes(term)) score += 1;
        if (season.includes(term)) score += 1;
      }

      return {
        ...place,
        similarity_score: score,
      };
    });

    return results
      .filter((place) => place.similarity_score > 0)
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, safeLimit)
      .map((place) => this.formatPlace(place));
  }

  private formatPlace(place: any) {
    if (!place) return place;

    return {
      ...place,
      highlights: this.parseJsonArray(place.highlights),
      experienceTypes: this.parseJsonArray(place.experienceTypes),
      platformFeatures: this.parseJsonArray(place.platformFeatures),
      recommendedMedia: this.parseJsonArray(place.recommendedMedia),
    };
  }

  private parseJsonArray(value: unknown) {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value !== 'string') {
      return [];
    }

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
