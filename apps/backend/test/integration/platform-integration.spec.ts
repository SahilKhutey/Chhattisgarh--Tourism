import { ForbiddenException } from '@nestjs/common';
import { ItineraryService } from '../../src/modules/itinerary/itinerary.service';
import { PlanningEngineService } from '../../src/modules/itinerary/engine/planning-engine.service';
import { FeasibilityService } from '../../src/modules/itinerary/engine/feasibility.service';
import { PlanningScoringService } from '../../src/modules/itinerary/engine/scoring.service';
import { SequencingService } from '../../src/modules/itinerary/engine/sequencing.service';
import { TravelTimeService } from '../../src/modules/itinerary/engine/time.service';
import { ExplanationService } from '../../src/modules/itinerary/engine/explanation.service';
import { PlanningCandidate, PlanningRequest } from '../../src/modules/itinerary/engine/planner.types';
import { passesHardFilters } from '../../src/modules/intelligence/recommendation.service';
import { AiProcessorService } from '../../src/modules/aggregation/ai-processor.service';
import { PaymentsService } from '../../src/modules/payments/payments.service';
import { MockPaymentProvider } from '../../src/modules/payments/mock-payment.provider';

describe('Final Integration: Critical Cross-Module Workflows (FI-27 – FI-32)', () => {
  describe('Test 1: Unpublished Place Exclusion', () => {
    it('does not expose unpublished places to discovery or recommendations', () => {
      const places = [
        { id: 'p1', name: 'Chitrakote Falls', status: 'PUBLISHED' },
        { id: 'p2', name: 'Secret Unapproved Cave', status: 'DRAFT' },
        { id: 'p3', name: 'Archived Sanctuary', status: 'ARCHIVED' },
      ];

      const validCandidates = places.filter((p) => passesHardFilters(p as any, {}));

      expect(validCandidates).toHaveLength(1);
      expect(validCandidates[0].id).toBe('p1');
      expect(validCandidates.every((p) => p.status === 'PUBLISHED')).toBe(true);
    });
  });

  describe('Test 2: Unavailable Place Exclusion in Itinerary Planning', () => {
    it('never includes an unpublished or unavailable place in generated itinerary stops', () => {
      const timeService = new TravelTimeService();
      const planningEngine = new PlanningEngineService(
        new FeasibilityService(),
        new PlanningScoringService(),
        new SequencingService(timeService),
        timeService,
        new ExplanationService(),
      );

      const candidatePlaces: PlanningCandidate[] = [
        {
          placeId: 'place-open',
          name: 'Chitrakote Waterfalls',
          slug: 'chitrakote-waterfalls',
          latitude: 19.2,
          longitude: 81.7,
          categoryName: 'Waterfalls',
          categoryIds: ['nature', 'waterfalls'],
          visitDurationMin: 90,
          estimatedCost: 50,
          rating: 4.8,
          reviewCount: 30,
          isPublished: true,
          isPublic: true,
          accessibility: true,
          seasonalAvailable: true,
        },
        {
          placeId: 'place-unpublished',
          name: 'Restricted Forest Camp',
          slug: 'restricted-forest-camp',
          latitude: 19.3,
          longitude: 81.8,
          categoryName: 'Adventure',
          categoryIds: ['adventure'],
          visitDurationMin: 60,
          estimatedCost: 0,
          rating: 3.0,
          reviewCount: 0,
          isPublished: false, // UNPUBLISHED
          isPublic: false,
          accessibility: false,
          seasonalAvailable: true,
        },
      ];

      const request: PlanningRequest = {
        tripId: 'trip-1',
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-02'),
        travelers: 2,
        pace: 'BALANCED',
      };

      const itinerary = planningEngine.generate(candidatePlaces, request);

      expect(itinerary.days.length).toBeGreaterThan(0);
      const stopPlaceIds = itinerary.days.flatMap((day) => day.stops.map((stop) => stop.placeId));
      expect(stopPlaceIds).toContain('place-open');
      expect(stopPlaceIds).not.toContain('place-unpublished');
    });
  });

  describe('Test 3: Ownership / IDOR Authorization', () => {
    it('rejects another user from modifying or accessing a private trip', async () => {
      const mockRepo = {
        getTrip: jest.fn().mockResolvedValue({
          id: 'trip-100',
          userId: 'user-owner-alice',
          startDate: new Date('2026-11-01'),
          endDate: new Date('2026-11-03'),
          travelers: 2,
        }),
      };

      const itineraryService = new ItineraryService(
        {} as any,
        mockRepo as any,
        {} as any,
        undefined,
        undefined,
        undefined,
      );

      // Attempting to access with different userId 'user-attacker-bob'
      await expect(
        itineraryService.getTrip('trip-100', 'user-attacker-bob'),
      ).rejects.toThrow(ForbiddenException);

      // Accessing with owner succeeds
      const trip = await itineraryService.getTrip('trip-100', 'user-owner-alice');
      expect(trip.id).toBe('trip-100');
    });
  });

  describe('Test 4: Booking & Payment Idempotency', () => {
    it('does not create duplicate records for the same idempotency key', async () => {
      const existingPaymentResponse = {
        clientSecret: 'mock_intent_secret_existing_123',
        status: 'REQUIRES_PAYMENT_METHOD',
        bookingId: 'booking-existing-1',
      };

      const prismaMock = {
        idempotencyKey: {
          findUnique: jest.fn().mockResolvedValue({
            key: 'idem-key-duplicate-test',
            response: existingPaymentResponse,
          }),
          create: jest.fn(),
        },
      };

      const paymentProvider = new MockPaymentProvider();
      const paymentsService = new PaymentsService(prismaMock as any, paymentProvider);

      const result = await paymentsService.createPaymentIntent('user-1', {
        bookingId: 'booking-new-request',
        idempotencyKey: 'idem-key-duplicate-test',
      });

      // Should return the cached existing response immediately
      expect(result).toEqual(existingPaymentResponse);
      expect(prismaMock.idempotencyKey.create).not.toHaveBeenCalled();
    });
  });

  describe('Test 5: AI Entity Validation Guardrails', () => {
    it('rejects AI-generated unknown or hallucinated entities and falls back strictly to verified data', async () => {
      const aiProcessor = new AiProcessorService();

      // Content with hallucinated destination not in Chhattisgarh knowledge base
      const hallucinatedContent = await aiProcessor.processContent(
        'Check out this mysterious alien mountain that definitely exists in CG!',
        ['mysterious', 'alien', 'unknown'],
      );

      // Detected location must NOT be invented
      expect(hallucinatedContent.detectedLocation).toBeNull();
      expect(hallucinatedContent.isTravelRelated).toBe(false);

      // Content with verified real destination
      const verifiedContent = await aiProcessor.processContent(
        'Visiting the stunning Chitrakote falls in Bastar, Chhattisgarh.',
        ['waterfall', 'travel'],
      );

      expect(verifiedContent.isTravelRelated).toBe(true);
      expect(verifiedContent.detectedLocation).toBe('Chitrakote Falls');
      expect(verifiedContent.detectedCategory).toBe('Waterfalls');
    });
  });
});
