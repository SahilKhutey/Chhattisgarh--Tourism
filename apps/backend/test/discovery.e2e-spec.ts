import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { DiscoveryModule } from '../src/modules/discovery/discovery.module';
import { PrismaService } from '../src/database/prisma.service';
import { SearchRepository } from '../src/modules/discovery/search/search.repository';
import { GeoService } from '../src/modules/discovery/geo/geo.service';
import { SuggestionService } from '../src/modules/discovery/suggestions/suggestion.service';
import { RedisService } from '../src/infrastructure/redis/redis.service';

describe('DiscoveryController (e2e)', () => {
  let app: INestApplication;

  const mockPrisma = {
    division: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'div-1', name: 'Bastar Division', slug: 'bastar-division', districts: [] },
      ]),
    },
    district: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'dist-1', name: 'Bastar', slug: 'bastar', places: [] },
      ]),
      findUnique: jest.fn().mockResolvedValue({
        id: 'dist-1',
        name: 'Bastar',
        slug: 'bastar',
        places: [],
        zones: [],
      }),
    },
    category: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'cat-1',
        name: 'Waterfalls',
        slug: 'waterfalls',
        places: [],
        placeCategories: [],
      }),
    },
    touristZone: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'zone-1',
        name: 'Bastar Heartland',
        slug: 'bastar-heartland',
        places: [],
        routes: [],
      }),
    },
    route: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'route-1',
        name: 'Tribal Trail',
        slug: 'tribal-trail',
        places: [],
      }),
    },
    $queryRaw: jest.fn().mockResolvedValue([]),
  };

  const mockSearchRepo = {
    search: jest.fn().mockResolvedValue([
      { id: 'p-1', name: 'Chitrakote Waterfall', slug: 'chitrakote' },
    ]),
  };

  const mockGeoService = {
    nearby: jest.fn().mockResolvedValue([
      { id: 'p-1', name: 'Chitrakote Waterfall', distanceMeters: 1200 },
    ]),
    mapViewport: jest.fn().mockResolvedValue([
      { id: 'p-1', name: 'Chitrakote Waterfall', latitude: 19.2, longitude: 81.7 },
    ]),
  };

  const mockSuggestionService = {
    suggest: jest.fn().mockResolvedValue(['Chitrakote Waterfall']),
    suggestStructured: jest.fn().mockResolvedValue([
      { type: 'place', name: 'Chitrakote Waterfall', slug: 'chitrakote' },
    ]),
  };

  const mockRedis = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    deletePattern: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DiscoveryModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(SearchRepository)
      .useValue(mockSearchRepo)
      .overrideProvider(GeoService)
      .useValue(mockGeoService)
      .overrideProvider(SuggestionService)
      .useValue(mockSuggestionService)
      .overrideProvider(RedisService)
      .useValue(mockRedis)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/discovery/search (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/discovery/search?q=Chitrakote')
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Chitrakote Waterfall');
  });

  it('/discovery/nearby (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/discovery/nearby?latitude=19.2&longitude=81.7&radius=10000')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].distanceMeters).toBe(1200);
  });

  it('/discovery/suggestions (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/discovery/suggestions?q=chi')
      .expect(200);

    expect(res.body).toBeDefined();
  });

  it('/discovery/map (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/discovery/map?north=22&south=18&east=84&west=80&zoom=8')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/discovery/districts (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/discovery/districts')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].slug).toBe('bastar');
  });

  it('/discovery/categories/:slug (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/discovery/categories/waterfalls')
      .expect(200);

    expect(res.body.slug).toBe('waterfalls');
  });
});
