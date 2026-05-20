import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';

@Injectable()
export class PlacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlaceDto) {
    const slug = dto.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const exists = await this.prisma.place.findUnique({
      where: { slug },
    });

    if (exists) {
      throw new BadRequestException(`Destination with a matching slug '${slug}' already exists.`);
    }

    return this.prisma.place.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        district: dto.district,
        categoryId: dto.categoryId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        heroImage: dto.heroImage,
        bestSeason: dto.bestSeason || 'All seasons',
        history: dto.history || 'Local oral lore preservation stage.',
        safetyInfo: dto.safetyInfo || 'Respect standard forest and water safety guidelines.',
        rules: dto.rules || 'Littering and standard plastics are prohibited.',
        verified: false, // Default to unverified staging queue for Admin moderation review
      },
    });
  }

  async findAll(categorySlug?: string, district?: string) {
    return this.prisma.place.findMany({
      where: {
        verified: true,
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(district ? { district } : {}),
      },
      include: {
        category: true,
        media: true,
      },
    });
  }

  async findBySlug(slug: string) {
    const place = await this.prisma.place.findUnique({
      where: { slug },
      include: {
        category: true,
        media: true,
        reviews: {
          include: {
            user: {
              select: { id: true, fullName: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!place) {
      throw new NotFoundException(`Destination with slug '${slug}' not found.`);
    }

    return place;
  }

  async findNearby(lat: number, lng: number, radiusKm: number) {
    try {
      const places: any[] = await this.prisma.$queryRaw`
        SELECT 
          p.id, p.name, p.slug, p.description, p.district, p."heroImage", p."bestSeason",
          p.latitude, p.longitude,
          ST_Distance(
            ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          ) / 1000 AS distance_km
        FROM "Place" p
        WHERE p.verified = true
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
            ${radiusKm * 1000}
          )
        ORDER BY distance_km ASC;
      `;
      return places;
    } catch (error) {
      console.warn('PostGIS query execution failed. Falling back to local mathematics calculations...', error.message);
      
      const allPlaces = await this.prisma.place.findMany({
        where: { verified: true },
        include: { category: true, media: true }
      });

      return allPlaces
        .map(place => {
          const distance = this.calculateDistance(lat, lng, place.latitude, place.longitude);
          return { ...place, distance_km: distance };
        })
        .filter(place => place.distance_km <= radiusKm)
        .sort((a, b) => a.distance_km - b.distance_km);
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
