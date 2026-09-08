import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  ContentHealthCalculationInput,
  ContentHealthStatus,
  ContentHealthSummary,
  PlaceHealthReport,
} from './dto/content-health.dto';

export function calculateContentHealth(input: ContentHealthCalculationInput): ContentHealthStatus {
  if (!input.hasCoordinates && !input.hasDistrict) {
    return 'INCOMPLETE';
  }

  let score = 100;

  if (!input.hasImage) score -= 20;
  if (!input.hasDescription) score -= 20;
  if (!input.hasCoordinates) score -= 25;
  if (!input.hasDistrict) score -= 15;
  if (!input.verified) score -= 15;
  if (input.daysSinceUpdate > 365) score -= 10;

  if (score > 80) return 'HEALTHY';
  if (score >= 60) return 'WARNING';
  if (score >= 40) return 'STALE';

  return 'INCOMPLETE';
}

export function calculateContentScore(input: ContentHealthCalculationInput): number {
  let score = 100;
  if (!input.hasImage) score -= 20;
  if (!input.hasDescription) score -= 20;
  if (!input.hasCoordinates) score -= 25;
  if (!input.hasDistrict) score -= 15;
  if (!input.verified) score -= 15;
  if (input.daysSinceUpdate > 365) score -= 10;
  return Math.max(0, score);
}

@Injectable()
export class ContentHealthService {
  constructor(private readonly prisma: PrismaService) {}

  calculateHealth(input: ContentHealthCalculationInput): ContentHealthStatus {
    return calculateContentHealth(input);
  }

  async getPlaceHealth(placeId: string): Promise<PlaceHealthReport> {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException(`Place with id ${placeId} not found`);
    }

    const now = new Date();
    const daysSinceUpdate = Math.floor(
      (now.getTime() - new Date(place.updatedAt).getTime()) / (1000 * 60 * 60 * 24),
    );

    const hasImage = Boolean(place.heroImage && place.heroImage.trim().length > 0);
    const hasDescription = Boolean(place.description && place.description.trim().length > 20);
    const hasCoordinates =
      place.latitude !== null &&
      place.longitude !== null &&
      Number.isFinite(place.latitude) &&
      Number.isFinite(place.longitude);
    const hasDistrict = Boolean(place.district && place.district.trim().length > 0);
    const verified = Boolean(place.verified);

    const input: ContentHealthCalculationInput = {
      hasImage,
      hasDescription,
      hasCoordinates,
      hasDistrict,
      verified,
      daysSinceUpdate,
    };

    const score = calculateContentScore(input);
    const status = calculateContentHealth(input);

    const warnings: string[] = [];
    if (!hasImage) warnings.push('Missing hero destination image');
    if (!hasDescription) warnings.push('Missing or too short description');
    if (!hasCoordinates) warnings.push('Missing geographic coordinates');
    if (!hasDistrict) warnings.push('Missing district linkage');
    if (!verified) warnings.push('Unverified destination content');
    if (daysSinceUpdate > 365) warnings.push('Content outdated (over 365 days since update)');

    return {
      placeId: place.id,
      name: place.name,
      slug: place.slug,
      score,
      status,
      warnings,
      lastUpdated: place.updatedAt,
    };
  }

  async getOverallSummary(): Promise<ContentHealthSummary> {
    const places = await this.prisma.place.findMany({
      select: {
        id: true,
        heroImage: true,
        description: true,
        latitude: true,
        longitude: true,
        district: true,
        verified: true,
        updatedAt: true,
      },
    });

    const now = new Date();
    let healthy = 0;
    let warning = 0;
    let stale = 0;
    let incomplete = 0;

    for (const place of places) {
      const daysSinceUpdate = Math.floor(
        (now.getTime() - new Date(place.updatedAt).getTime()) / (1000 * 60 * 60 * 24),
      );

      const status = calculateContentHealth({
        hasImage: Boolean(place.heroImage && place.heroImage.trim().length > 0),
        hasDescription: Boolean(place.description && place.description.trim().length > 20),
        hasCoordinates:
          place.latitude !== null &&
          place.longitude !== null &&
          Number.isFinite(place.latitude) &&
          Number.isFinite(place.longitude),
        hasDistrict: Boolean(place.district && place.district.trim().length > 0),
        verified: Boolean(place.verified),
        daysSinceUpdate,
      });

      if (status === 'HEALTHY') healthy++;
      else if (status === 'WARNING') warning++;
      else if (status === 'STALE') stale++;
      else incomplete++;
    }

    const total = places.length;
    const safeTotal = total > 0 ? total : 1;

    return {
      total,
      healthy,
      warning,
      stale,
      incomplete,
      healthyPercentage: Math.round((healthy / safeTotal) * 100),
      warningPercentage: Math.round((warning / safeTotal) * 100),
      stalePercentage: Math.round((stale / safeTotal) * 100),
      incompletePercentage: Math.round((incomplete / safeTotal) * 100),
    };
  }
}
