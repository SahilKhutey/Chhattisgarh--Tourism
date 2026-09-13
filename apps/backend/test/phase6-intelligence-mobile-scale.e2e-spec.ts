import { Test, TestingModule } from '@nestjs/testing';
import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AnalyticsModule } from '../src/modules/analytics/analytics.module';
import { IntelligenceModule } from '../src/modules/intelligence/intelligence.module';
import { MobileModule } from '../src/modules/mobile/mobile.module';
import { PrismaService } from '../src/database/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/jwt-auth.guard';
import { AnalyticsEventType } from '../src/modules/analytics/types/analytics-event.type';

class MockJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { id: 'user-mobile-1', role: 'USER' };
    return true;
  }
}

describe('Phase 6 E2E: Intelligence, Mobile, Analytics & Scale', () => {
  let app: INestApplication;

  const store = {
    events: [] as any[],
    places: new Map<string, any>(),
    devices: new Map<string, any>(),
  };

  beforeEach(() => {
    store.events = [];
    store.places.clear();
    store.devices.clear();

    // Seed published places
    store.places.set('place-chitrakote', {
      id: 'place-chitrakote',
      name: 'Chitrakote Falls',
      slug: 'chitrakote-falls',
      category: { name: 'Waterfalls' },
      categoryId: 'cat-waterfalls',
      district: 'Bastar',
      latitude: 19.2,
      longitude: 81.7,
      status: 'PUBLISHED',
      reviews: [{ rating: 4.8 }, { rating: 5.0 }],
      _count: { bookings: 45 },
      updatedAt: new Date(),
    });

    store.places.set('place-bhoramdeo', {
      id: 'place-bhoramdeo',
      name: 'Bhoramdeo Temple',
      slug: 'bhoramdeo-temple',
      category: { name: 'Heritage' },
      categoryId: 'cat-heritage',
      district: 'Kabirdham',
      latitude: 22.1,
      longitude: 81.2,
      status: 'PUBLISHED',
      reviews: [{ rating: 4.7 }],
      _count: { bookings: 30 },
      updatedAt: new Date(),
    });

    store.places.set('place-draft', {
      id: 'place-draft',
      name: 'Secret Cave (Unpublished)',
      slug: 'secret-cave',
      category: { name: 'Caves' },
      categoryId: 'cat-caves',
      district: 'Kanker',
      status: 'DRAFT',
      reviews: [],
      _count: { bookings: 0 },
      updatedAt: new Date(),
    });

    // Seed analytics events
    store.events.push(
      {
        id: 'evt-1',
        type: AnalyticsEventType.PLACE_VIEW,
        placeId: 'place-chitrakote',
        districtId: 'Bastar',
        createdAt: new Date(),
        metadata: {},
      },
      {
        id: 'evt-2',
        type: AnalyticsEventType.SEARCH,
        districtId: 'Bastar',
        createdAt: new Date(),
        metadata: { query: 'waterfall' },
      },
      {
        id: 'evt-3',
        type: AnalyticsEventType.BOOKING_COMPLETED,
        placeId: 'place-chitrakote',
        districtId: 'Bastar',
        createdAt: new Date(),
        metadata: {},
      },
    );
  });

  const prismaMock = {
    analyticsEvent: {
      create: jest.fn().mockImplementation(({ data }) => {
        const item = { id: `evt-${Date.now()}`, createdAt: new Date(), ...data };
        store.events.push(item);
        return Promise.resolve(item);
      }),
      groupBy: jest.fn().mockImplementation(({ by, where }) => {
        if (by.includes('districtId') && by.includes('type')) {
          return Promise.resolve([
            { districtId: 'Bastar', type: 'PLACE_VIEW', _count: { _all: 10 } },
            { districtId: 'Bastar', type: 'SEARCH', _count: { _all: 5 } },
            { districtId: 'Bastar', type: 'BOOKING_COMPLETED', _count: { _all: 2 } },
          ]);
        }
        if (by.includes('districtId')) {
          return Promise.resolve([
            { districtId: 'Bastar', _count: { _all: 17 } },
          ]);
        }
        if (by.includes('placeId')) {
          return Promise.resolve([
            { placeId: 'place-chitrakote', _count: { _all: 10 } },
          ]);
        }
        return Promise.resolve([
          { type: 'PLACE_VIEW', _count: { _all: 10 } },
        ]);
      }),
      count: jest.fn().mockResolvedValue(10),
    },
    place: {
      findMany: jest.fn().mockImplementation(({ where }) => {
        const list = Array.from(store.places.values());
        if (where?.status === 'PUBLISHED') {
          return Promise.resolve(list.filter((p) => p.status === 'PUBLISHED'));
        }
        return Promise.resolve(list);
      }),
    },
    mobileDevice: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        return Promise.resolve(store.devices.get(where.deviceToken) || null);
      }),
      create: jest.fn().mockImplementation(({ data }) => {
        const item = { id: `dev-${Date.now()}`, ...data, active: true, lastSeenAt: new Date() };
        store.devices.set(data.deviceToken, item);
        return Promise.resolve(item);
      }),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const existing = store.devices.get(where.deviceToken);
        if (existing) {
          Object.assign(existing, data);
        }
        return Promise.resolve(existing);
      }),
    },
    booking: {
      count: jest.fn().mockResolvedValue(50),
      aggregate: jest.fn().mockResolvedValue({
        _sum: { totalPricePaise: 2500000, platformFeePaise: 125000 },
      }),
    },
    tourismMetric: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'tm-1', ...data })),
    },
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AnalyticsModule, IntelligenceModule, MobileModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Analytics Engine & Privacy Sanitization', () => {
    it('redacts sensitive keys from event metadata before recording', async () => {
      const payload = {
        type: 'PAGE_VIEW',
        placeId: 'place-chitrakote',
        metadata: {
          path: '/places/chitrakote',
          password: 'plainPassword123',
          authToken: 'jwt-header-token',
          apiKey: 'gemini-key',
          nested: {
            creditCard: '4111-2222-3333-4444',
            safeValue: 'ok',
          },
        },
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/analytics/events')
        .send(payload)
        .expect(201);

      expect(res.body.type).toBe('PAGE_VIEW');
      expect(res.body.metadata.password).toBe('[REDACTED]');
      expect(res.body.metadata.authToken).toBe('[REDACTED]');
      expect(res.body.metadata.apiKey).toBe('[REDACTED]');
      expect(res.body.metadata.nested.creditCard).toBe('[REDACTED]');
      expect(res.body.metadata.nested.safeValue).toBe('ok');
    });

    it('returns district trends and place engagement aggregations', async () => {
      const trendsRes = await request(app.getHttpServer())
        .get('/api/v1/analytics/trends/districts?days=30')
        .expect(200);

      expect(Array.isArray(trendsRes.body)).toBe(true);
      expect(trendsRes.body[0].districtId).toBe('Bastar');

      const engagementRes = await request(app.getHttpServer())
        .get('/api/v1/analytics/places/place-chitrakote/engagement')
        .expect(200);

      expect(engagementRes.body.placeId).toBe('place-chitrakote');
      expect(engagementRes.body.views).toBeDefined();
    });
  });

  describe('2. Deterministic Recommendation Engine', () => {
    it('returns ranked recommendations with normalized 6-factor composite scores and explainability', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/intelligence/recommendations?category=Waterfalls&district=Bastar&lat=19.2&lng=81.7&limit=5')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const top = res.body[0];
      expect(top.id).toBe('place-chitrakote');
      expect(top.score).toBeGreaterThan(0.5);
      expect(top.score).toBeLessThanOrEqual(1.0);
      expect(top.factorScores).toBeDefined();
      expect(top.factorScores.preferenceMatch).toBeGreaterThanOrEqual(0.0);
      expect(top.factorScores.distanceScore).toBeGreaterThanOrEqual(0.0);
      expect(top.reason).toBeDefined();
      expect(typeof top.reason).toBe('string');
    });

    it('excludes draft or unpublished destinations from recommendations', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/intelligence/recommendations')
        .expect(200);

      const draftPlace = res.body.find((r: any) => r.id === 'place-draft');
      expect(draftPlace).toBeUndefined();
    });
  });

  describe('3. Regional Intelligence & Velocity Engine', () => {
    it('computes district demand indices and activity levels', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/intelligence/regional-demand?days=14')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].district).toBe('Bastar');
      expect(res.body[0].demandIndex).toBeGreaterThan(0);
      expect(['LOW', 'MODERATE', 'HIGH', 'SURGING']).toContain(res.body[0].demandLevel);
    });

    it('identifies emerging destinations with positive search velocity', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/intelligence/emerging?limit=3')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].placeId).toBe('place-chitrakote');
      expect(res.body[0].velocityPercent).toBeDefined();
    });
  });

  describe('4. Mobile Integration & Device Token Lifecycle', () => {
    it('registers a mobile device token for push alerts', async () => {
      const res = await request(app.getHttpServer())
        .post('/mobile/devices/register')
        .set('Authorization', 'Bearer tourist-token')
        .send({
          deviceToken: 'fcm-device-token-12345678901234567890',
          platform: 'android',
          appVersion: '2.1.0',
          deviceId: 'device-pixel-8',
        })
        .expect(201);

      expect(res.body.platform).toBe('android');
      expect(res.body.active).toBe(true);
    });

    it('unregisters device token on user sign-out', async () => {
      store.devices.set('fcm-device-token-12345678901234567890', {
        id: 'dev-1',
        userId: 'user-mobile-1',
        deviceToken: 'fcm-device-token-12345678901234567890',
        active: true,
      });

      await request(app.getHttpServer())
        .delete('/mobile/devices/register')
        .set('Authorization', 'Bearer tourist-token')
        .send({
          deviceToken: 'fcm-device-token-12345678901234567890',
        })
        .expect(200);

      const device = store.devices.get('fcm-device-token-12345678901234567890');
      expect(device.active).toBe(false);
    });

  });
});
