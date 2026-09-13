import {
  RecommendationService,
  RECOMMENDATION_WEIGHTS,
  passesHardFilters,
  computePreferenceMatch,
  computeDistanceScore,
  computeQualityScore,
  computeFreshnessScore,
  computePopularityScore,
  computeSafetyScore,
  generateExplainableReason,
  RecommendationCandidateInput,
} from './recommendation.service';

describe('RecommendationService', () => {
  let service: RecommendationService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      place: {
        findMany: jest.fn(),
      },
    };
    service = new RecommendationService(mockPrisma);
  });

  describe('Weights and Normalization', () => {
    it('ensures all 6 weights sum exactly to 1.0', () => {
      const sum =
        RECOMMENDATION_WEIGHTS.PREFERENCE +
        RECOMMENDATION_WEIGHTS.DISTANCE +
        RECOMMENDATION_WEIGHTS.QUALITY +
        RECOMMENDATION_WEIGHTS.FRESHNESS +
        RECOMMENDATION_WEIGHTS.POPULARITY +
        RECOMMENDATION_WEIGHTS.SAFETY;

      expect(sum).toBeCloseTo(1.0, 5);
      expect(RECOMMENDATION_WEIGHTS.PREFERENCE).toBe(0.30);
      expect(RECOMMENDATION_WEIGHTS.DISTANCE).toBe(0.15);
      expect(RECOMMENDATION_WEIGHTS.QUALITY).toBe(0.20);
      expect(RECOMMENDATION_WEIGHTS.FRESHNESS).toBe(0.10);
      expect(RECOMMENDATION_WEIGHTS.POPULARITY).toBe(0.10);
      expect(RECOMMENDATION_WEIGHTS.SAFETY).toBe(0.15);
    });

    it('bounds individual factors within [0.0, 1.0]', () => {
      const candidate: RecommendationCandidateInput = {
        id: 'place-1',
        name: 'Chitrakote Falls',
        status: 'PUBLISHED',
        category: 'Waterfalls',
        district: 'Bastar',
        latitude: 19.2,
        longitude: 81.7,
        rating: 4.8,
        reviewCount: 50,
        viewCount: 1500,
        updatedAt: new Date(),
        isAccessible: true,
        activeAlertSeverity: 'NONE',
      };

      const prefs = {
        categories: ['Waterfalls'],
        districts: ['Bastar'],
        userLat: 19.21,
        userLng: 81.71,
      };

      const prefScore = computePreferenceMatch(candidate, prefs);
      const distScore = computeDistanceScore(candidate, prefs);
      const qualScore = computeQualityScore(candidate);
      const freshScore = computeFreshnessScore(candidate);
      const popScore = computePopularityScore(candidate);
      const safeScore = computeSafetyScore(candidate);

      [prefScore, distScore, qualScore, freshScore, popScore, safeScore].forEach((val) => {
        expect(val).toBeGreaterThanOrEqual(0.0);
        expect(val).toBeLessThanOrEqual(1.0);
      });
    });
  });

  describe('Hard Filters', () => {
    const baseCandidate: RecommendationCandidateInput = {
      id: 'place-test',
      name: 'Test Place',
      status: 'PUBLISHED',
      isAccessible: true,
      closedMonths: [7, 8], // Monsoon closure
    };

    it('rejects unpublished or draft places', () => {
      expect(passesHardFilters({ ...baseCandidate, status: 'DRAFT' }, {})).toBe(false);
      expect(passesHardFilters({ ...baseCandidate, status: 'ARCHIVED' }, {})).toBe(false);
      expect(passesHardFilters(baseCandidate, {})).toBe(true);
    });

    it('rejects inaccessible places when accessibility is required', () => {
      expect(
        passesHardFilters(
          { ...baseCandidate, isAccessible: false },
          { accessibilityRequired: true },
        ),
      ).toBe(false);

      expect(
        passesHardFilters(
          { ...baseCandidate, isAccessible: true },
          { accessibilityRequired: true },
        ),
      ).toBe(true);
    });

    it('rejects places closed during the requested travel month', () => {
      expect(
        passesHardFilters(baseCandidate, { travelMonth: 7 }),
      ).toBe(false);

      expect(
        passesHardFilters(baseCandidate, { travelMonth: 11 }),
      ).toBe(true);
    });
  });

  describe('Category Diversification', () => {
    it('enforces maximum per category limit in top recommendations', () => {
      const candidates: RecommendationCandidateInput[] = [
        { id: 'w1', name: 'Waterfall 1', category: 'Waterfalls', district: 'Bastar', status: 'PUBLISHED', rating: 4.9 },
        { id: 'w2', name: 'Waterfall 2', category: 'Waterfalls', district: 'Bastar', status: 'PUBLISHED', rating: 4.8 },
        { id: 'w3', name: 'Waterfall 3', category: 'Waterfalls', district: 'Bastar', status: 'PUBLISHED', rating: 4.7 },
        { id: 'w4', name: 'Waterfall 4', category: 'Waterfalls', district: 'Bastar', status: 'PUBLISHED', rating: 4.6 },
        { id: 't1', name: 'Temple 1', category: 'Temples', district: 'Bastar', status: 'PUBLISHED', rating: 4.5 },
        { id: 't2', name: 'Temple 2', category: 'Temples', district: 'Bastar', status: 'PUBLISHED', rating: 4.4 },
        { id: 'c1', name: 'Caves 1', category: 'Caves', district: 'Bastar', status: 'PUBLISHED', rating: 4.3 },
      ];

      const ranked = service.rankAndDiversify(candidates, { maxPerCategory: 2 }, 5);

      expect(ranked).toHaveLength(5);
      const waterfallCount = ranked.filter((r) => r.category === 'Waterfalls').length;
      expect(waterfallCount).toBeLessThanOrEqual(2);
      expect(ranked.some((r) => r.category === 'Temples')).toBe(true);
      expect(ranked.some((r) => r.category === 'Caves')).toBe(true);
    });
  });

  describe('Explainability', () => {
    it('generates preference-based explanation when preference match is high', () => {
      const candidate: RecommendationCandidateInput = {
        id: 'p1',
        name: 'Tirathgarh',
        category: 'Waterfalls',
        district: 'Bastar',
        status: 'PUBLISHED',
      };

      const reason = generateExplainableReason(candidate, {
        preferenceMatch: 0.9,
        distanceScore: 0.5,
        qualityScore: 0.5,
        freshnessScore: 0.5,
        popularityScore: 0.5,
        safetyScore: 1.0,
      });

      expect(reason).toContain('Waterfalls');
    });

    it('generates rating-based explanation when quality score is prominent', () => {
      const candidate: RecommendationCandidateInput = {
        id: 'p2',
        name: 'Bhoramdeo Temple',
        category: 'Heritage',
        district: 'Kabirdham',
        rating: 4.9,
        status: 'PUBLISHED',
      };

      const reason = generateExplainableReason(candidate, {
        preferenceMatch: 0.5,
        distanceScore: 0.5,
        qualityScore: 0.85,
        freshnessScore: 0.5,
        popularityScore: 0.5,
        safetyScore: 1.0,
      });

      expect(reason).toContain('4.9★');
      expect(reason).toContain('Kabirdham');
    });
  });
});
