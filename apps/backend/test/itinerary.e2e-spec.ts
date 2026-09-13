import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ItineraryModule } from '../src/modules/itinerary/itinerary.module';
import { PrismaService } from '../src/database/prisma.service';
import { RedisService } from '../src/infrastructure/redis/redis.service';
import { AnalyticsService } from '../src/modules/analytics/analytics.service';

describe('ItineraryController (e2e)', () => {
  let app: INestApplication;

  const mockTrip = {
    id: 'trip-e2e-1',
    title: 'Bastar Autumn Tour',
    startDate: new Date('2026-10-01'),
    endDate: new Date('2026-10-03'),
    travelers: 2,
    status: 'READY',
    preferences: {
      categories: ['nature', 'waterfalls'],
      pace: 'BALANCED',
      accessibility: false,
    },
    constraints: {
      budgetAmount: 10000,
    },
    itineraries: [
      {
        id: 'itin-e2e-1',
        tripId: 'trip-e2e-1',
        version: 1,
        status: 'READY',
        totalDistanceKm: 85.5,
        totalDurationMin: 280,
        estimatedCost: 600,
        days: [
          {
            id: 'day-1',
            sequence: 1,
            date: new Date('2026-10-01'),
            startTime: '09:00',
            endTime: '17:00',
            stops: [
              {
                id: 'stop-1',
                dayId: 'day-1',
                sequence: 1,
                placeId: 'place-1',
                place: { name: 'Chitrakote Falls', slug: 'chitrakote-falls', latitude: 19.2, longitude: 81.7 },
                arrivalTime: '09:30',
                departureTime: '11:30',
                travelFromPreviousMin: 30,
                visitDurationMin: 120,
                estimatedCost: 100,
                reason: 'Matches nature preference',
                isLocked: false,
              },
            ],
          },
        ],
      },
    ],
  };

  const mockPlaces = [
    {
      id: 'place-1',
      name: 'Chitrakote Falls',
      slug: 'chitrakote-falls',
      latitude: 19.201,
      longitude: 81.701,
      district: 'Bastar',
      verified: true,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      bookingPricePaise: 10000,
      category: { id: 'cat-1', name: 'Nature', slug: 'nature' },
      planningProfile: { estimatedVisitMinutes: 120, planningEnabled: true, visitorCapacity: 100 },
      reviews: [{ rating: 5 }, { rating: 4.8 }],
      scores: { popularity: 95 },
      experiences: [],
      safety: { accessibility: 'FULL' },
    },
    {
      id: 'place-2',
      name: 'Danteshwari Temple',
      slug: 'danteshwari-temple',
      latitude: 18.896,
      longitude: 81.352,
      district: 'Dantewada',
      verified: true,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      bookingPricePaise: 0,
      category: { id: 'cat-2', name: 'Heritage', slug: 'heritage' },
      planningProfile: { estimatedVisitMinutes: 90, planningEnabled: true, visitorCapacity: 200 },
      reviews: [{ rating: 4.5 }],
      scores: { popularity: 88 },
      experiences: [],
      safety: { accessibility: 'PARTIAL' },
    },
  ];

  const mockPrisma = {
    trip: {
      create: jest.fn().mockResolvedValue(mockTrip),
      findUnique: jest.fn().mockResolvedValue(mockTrip),
      findMany: jest.fn().mockResolvedValue([mockTrip]),
      update: jest.fn().mockResolvedValue(mockTrip),
    },
    place: {
      findMany: jest.fn().mockResolvedValue(mockPlaces),
    },
    itinerary: {
      findFirst: jest.fn().mockResolvedValue(mockTrip.itineraries[0]),
      create: jest.fn().mockResolvedValue(mockTrip.itineraries[0]),
    },
    itineraryStop: {
      update: jest.fn().mockResolvedValue({ id: 'stop-1', sequence: 2 }),
    },
    $transaction: jest.fn().mockImplementation(async (cb) => cb(mockPrisma)),
  };

  const mockRedis = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    deletePattern: jest.fn().mockResolvedValue(1),
  };

  const mockAnalytics = {
    track: jest.fn().mockResolvedValue({ id: 'evt-1' }),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ItineraryModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(RedisService)
      .useValue(mockRedis)
      .overrideProvider(AnalyticsService)
      .useValue(mockAnalytics)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /itineraries - creates a trip planning container', async () => {
    const res = await request(app.getHttpServer())
      .post('/itineraries')
      .send({
        title: 'Bastar Autumn Tour',
        startDate: '2026-10-01',
        endDate: '2026-10-03',
        travelers: 2,
        categories: ['nature'],
        pace: 'BALANCED',
        budgetAmount: 10000,
      })
      .expect(201);

    expect(res.body.id).toBe('trip-e2e-1');
  });

  it('GET /itineraries/:id - retrieves trip and versioned itinerary', async () => {
    const res = await request(app.getHttpServer())
      .get('/itineraries/trip-e2e-1')
      .expect(200);

    expect(res.body.id).toBe('trip-e2e-1');
    expect(res.body.itineraries).toHaveLength(1);
  });

  it('POST /itineraries/:id/generate - generates multi-day itinerary', async () => {
    const res = await request(app.getHttpServer())
      .post('/itineraries/trip-e2e-1/generate')
      .send({
        pace: 'BALANCED',
        categories: ['nature'],
        maxDailyTravelMin: 480,
      })
      .expect(201);

    expect(res.body.id).toBe('itin-e2e-1');
  });

  it('POST /itineraries/:id/reorder - reorders stops', async () => {
    const res = await request(app.getHttpServer())
      .post('/itineraries/trip-e2e-1/reorder')
      .send({
        stopId: 'stop-1',
        targetDaySequence: 1,
        targetStopSequence: 2,
      })
      .expect(201);

    expect(res.body.id).toBe('trip-e2e-1');
  });

  it('POST /itinerary/generate - preserves legacy in-memory itinerary API', async () => {
    const res = await request(app.getHttpServer())
      .post('/itinerary/generate')
      .send({
        district: 'Bastar',
        durationDays: 2,
        pace: 'moderate',
        interests: ['nature'],
        travelers: 2,
      })
      .expect(201);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('rejects invalid inputs on trip creation', async () => {
    await request(app.getHttpServer())
      .post('/itineraries')
      .send({
        title: '', // empty title
        startDate: 'invalid-date',
      })
      .expect(400);
  });
});
