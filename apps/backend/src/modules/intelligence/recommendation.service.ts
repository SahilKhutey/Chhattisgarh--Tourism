import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface RecommendationPreferences {
  categories?: string[];
  interests?: string[];
  districts?: string[];
  userLat?: number;
  userLng?: number;
  accessibilityRequired?: boolean;
  travelMonth?: number; // 1 - 12
  maxPerCategory?: number; // default 2
}

export interface RecommendationCandidateInput {
  id: string;
  name: string;
  slug?: string;
  category?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  status: string; // 'PUBLISHED' | 'DRAFT' | etc.
  rating?: number;
  reviewCount?: number;
  viewCount?: number;
  updatedAt?: Date | string;
  isAccessible?: boolean;
  closedMonths?: number[];
  activeAlertSeverity?: 'NONE' | 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface RecommendationFactorScores {
  preferenceMatch: number;
  distanceScore: number;
  qualityScore: number;
  freshnessScore: number;
  popularityScore: number;
  safetyScore: number;
}

export interface ScoredRecommendation {
  id: string;
  name: string;
  slug?: string;
  category: string;
  district: string;
  score: number;
  factorScores: RecommendationFactorScores;
  reason: string;
}

export const RECOMMENDATION_WEIGHTS = {
  PREFERENCE: 0.30,
  DISTANCE: 0.15,
  QUALITY: 0.20,
  FRESHNESS: 0.10,
  POPULARITY: 0.10,
  SAFETY: 0.15,
} as const;

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function passesHardFilters(
  candidate: RecommendationCandidateInput,
  prefs: RecommendationPreferences,
): boolean {
  // Hard Filter 1: Must be PUBLISHED
  if (candidate.status !== 'PUBLISHED') {
    return false;
  }

  // Hard Filter 2: Accessibility constraint
  if (prefs.accessibilityRequired && !candidate.isAccessible) {
    return false;
  }

  // Hard Filter 3: Seasonal availability
  if (
    prefs.travelMonth &&
    Array.isArray(candidate.closedMonths) &&
    candidate.closedMonths.includes(prefs.travelMonth)
  ) {
    return false;
  }

  return true;
}

export function computePreferenceMatch(
  candidate: RecommendationCandidateInput,
  prefs: RecommendationPreferences,
): number {
  const requestedCategories = prefs.categories || prefs.interests || [];
  const requestedDistricts = prefs.districts || [];

  if (requestedCategories.length === 0 && requestedDistricts.length === 0) {
    return 0.5; // Neutral base score when no preferences specified
  }

  let matchedFactors = 0;
  let possibleFactors = 0;

  if (requestedCategories.length > 0) {
    possibleFactors += 0.6;
    const catLower = (candidate.category || '').toLowerCase();
    const hasCatMatch = requestedCategories.some((c) =>
      catLower.includes(c.toLowerCase()),
    );
    if (hasCatMatch) {
      matchedFactors += 0.6;
    }
  }

  if (requestedDistricts.length > 0) {
    possibleFactors += 0.4;
    const distLower = (candidate.district || '').toLowerCase();
    const hasDistMatch = requestedDistricts.some((d) =>
      distLower.includes(d.toLowerCase()),
    );
    if (hasDistMatch) {
      matchedFactors += 0.4;
    }
  }

  if (possibleFactors === 0) {
    return 0.5;
  }

  const raw = matchedFactors / possibleFactors;
  return Number(Math.max(0.1, Math.min(1.0, raw)).toFixed(4));
}

export function computeDistanceScore(
  candidate: RecommendationCandidateInput,
  prefs: RecommendationPreferences,
): number {
  if (
    prefs.userLat === undefined ||
    prefs.userLng === undefined ||
    candidate.latitude === undefined ||
    candidate.longitude === undefined
  ) {
    return 0.5; // Neutral when coordinates not provided
  }

  const distKm = haversineDistanceKm(
    prefs.userLat,
    prefs.userLng,
    candidate.latitude,
    candidate.longitude,
  );

  if (distKm <= 15) return 1.0;
  if (distKm >= 500) return 0.0;

  const score = 1.0 - (distKm - 15) / 485;
  return Number(Math.max(0.0, Math.min(1.0, score)).toFixed(4));
}

export function computeQualityScore(
  candidate: RecommendationCandidateInput,
): number {
  const rating = candidate.rating ?? 4.0;
  const reviews = candidate.reviewCount ?? 0;

  const ratingNormalized = Math.max(0, Math.min(1, (rating - 1) / 4));
  const confidence = Math.min(1.0, reviews / 20);

  const score = 0.7 * ratingNormalized + 0.3 * (reviews > 0 ? confidence : 0.5);
  return Number(Math.max(0.0, Math.min(1.0, score)).toFixed(4));
}

export function computeFreshnessScore(
  candidate: RecommendationCandidateInput,
): number {
  if (!candidate.updatedAt) {
    return 0.5;
  }

  const updated = new Date(candidate.updatedAt).getTime();
  const diffDays = Math.max(0, (Date.now() - updated) / (1000 * 60 * 60 * 24));

  if (diffDays <= 30) return 1.0;
  if (diffDays <= 90) return 0.8;
  if (diffDays <= 180) return 0.6;
  if (diffDays <= 365) return 0.4;
  return 0.2;
}

export function computePopularityScore(
  candidate: RecommendationCandidateInput,
): number {
  const views = candidate.viewCount ?? 0;
  const score = Math.min(1.0, Math.log10(views + 1) / 3.0);
  return Number(Math.max(0.0, Math.min(1.0, score)).toFixed(4));
}

export function computeSafetyScore(
  candidate: RecommendationCandidateInput,
): number {
  switch (candidate.activeAlertSeverity) {
    case 'CRITICAL':
      return 0.1;
    case 'WARNING':
      return 0.5;
    case 'INFO':
      return 0.8;
    case 'NONE':
    default:
      return 1.0;
  }
}

export function generateExplainableReason(
  candidate: RecommendationCandidateInput,
  factors: RecommendationFactorScores,
): string {
  const category = candidate.category || 'Destinations';
  const district = candidate.district || 'Chhattisgarh';

  if (factors.preferenceMatch >= 0.8) {
    return `Matches your interest in ${category}`;
  }
  if (factors.distanceScore >= 0.8) {
    return `Convenient destination in ${district}`;
  }
  if (factors.qualityScore >= 0.8) {
    const rating = (candidate.rating ?? 4.5).toFixed(1);
    return `Top rated ${rating}★ experience in ${district}`;
  }
  if (factors.popularityScore >= 0.8) {
    return `Trending destination among Chhattisgarh travelers`;
  }
  return `Curated regional highlight in ${district}`;
}

@Injectable()
export class RecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  scoreCandidate(
    candidate: RecommendationCandidateInput,
    prefs: RecommendationPreferences,
  ): ScoredRecommendation | null {
    if (!passesHardFilters(candidate, prefs)) {
      return null;
    }

    const factorScores: RecommendationFactorScores = {
      preferenceMatch: computePreferenceMatch(candidate, prefs),
      distanceScore: computeDistanceScore(candidate, prefs),
      qualityScore: computeQualityScore(candidate),
      freshnessScore: computeFreshnessScore(candidate),
      popularityScore: computePopularityScore(candidate),
      safetyScore: computeSafetyScore(candidate),
    };

    const compositeScore =
      factorScores.preferenceMatch * RECOMMENDATION_WEIGHTS.PREFERENCE +
      factorScores.distanceScore * RECOMMENDATION_WEIGHTS.DISTANCE +
      factorScores.qualityScore * RECOMMENDATION_WEIGHTS.QUALITY +
      factorScores.freshnessScore * RECOMMENDATION_WEIGHTS.FRESHNESS +
      factorScores.popularityScore * RECOMMENDATION_WEIGHTS.POPULARITY +
      factorScores.safetyScore * RECOMMENDATION_WEIGHTS.SAFETY;

    const roundedScore = Number(compositeScore.toFixed(4));
    const reason = generateExplainableReason(candidate, factorScores);

    return {
      id: candidate.id,
      name: candidate.name,
      slug: candidate.slug,
      category: candidate.category || 'General',
      district: candidate.district || 'Chhattisgarh',
      score: roundedScore,
      factorScores,
      reason,
    };
  }

  rankAndDiversify(
    candidates: RecommendationCandidateInput[],
    prefs: RecommendationPreferences,
    limit = 8,
  ): ScoredRecommendation[] {
    const scoredList: ScoredRecommendation[] = [];

    for (const c of candidates) {
      const scored = this.scoreCandidate(c, prefs);
      if (scored) {
        scoredList.push(scored);
      }
    }

    // Sort descending by composite score
    scoredList.sort((a, b) => b.score - a.score);

    const maxPerCat = prefs.maxPerCategory ?? 2;
    const categoryCounts: Record<string, number> = {};
    const selected: ScoredRecommendation[] = [];
    const overflow: ScoredRecommendation[] = [];

    for (const item of scoredList) {
      const cat = (item.category || 'General').toLowerCase();
      const currentCount = categoryCounts[cat] ?? 0;

      if (currentCount < maxPerCat) {
        categoryCounts[cat] = currentCount + 1;
        selected.push(item);
      } else {
        overflow.push(item);
      }

      if (selected.length >= limit) {
        break;
      }
    }

    // Backfill with overflow if under limit
    if (selected.length < limit) {
      for (const item of overflow) {
        selected.push(item);
        if (selected.length >= limit) {
          break;
        }
      }
    }

    return selected.slice(0, limit);
  }

  async getRecommendations(
    prefs: RecommendationPreferences,
    limit = 8,
  ): Promise<ScoredRecommendation[]> {
    const places = await this.prisma.place.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        category: {
          select: { name: true },
        },
        reviews: {
          select: { rating: true },
        },
        _count: {
          select: { bookings: true },
        },
      },
      take: 100,
    });

    const candidates: RecommendationCandidateInput[] = places.map((p) => {
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
          : 4.2;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category?.name || 'Nature',
        district: p.district || 'Chhattisgarh',
        latitude: p.latitude,
        longitude: p.longitude,
        status: p.status,
        rating: avgRating,
        reviewCount: p.reviews.length,
        viewCount: 250, // default baseline
        updatedAt: p.updatedAt,
        isAccessible: true,
      };
    });

    return this.rankAndDiversify(candidates, prefs, limit);
  }
}

