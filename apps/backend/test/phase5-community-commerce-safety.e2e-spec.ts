import { Test, TestingModule } from '@nestjs/testing';
import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { CommunityModule } from '../src/modules/community/community.module';
import { ReviewsModule } from '../src/modules/reviews/reviews.module';
import { BookingsModule } from '../src/modules/bookings/bookings.module';
import { PaymentsModule } from '../src/modules/payments/payments.module';
import { EmergencyModule } from '../src/modules/emergency/emergency.module';
import { OutboxModule } from '../src/modules/outbox/outbox.module';
import { AuditModule } from '../src/modules/audit/audit.module';
import { PrismaService } from '../src/database/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/jwt-auth.guard';
import { PartnerStatus, PaymentStatus } from '@prisma/client';

class MockJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] || '';

    if (auth.includes('unverified-creator')) {
      req.user = { id: 'user-unverified', role: 'USER' };
    } else if (auth.includes('verified-creator')) {
      req.user = { id: 'user-verified', role: 'CREATOR' };
    } else if (auth.includes('responder')) {
      req.user = { id: 'user-responder', role: 'RESPONDER' };
    } else if (auth.includes('admin')) {
      req.user = { id: 'user-admin', role: 'ADMIN' };
    } else {
      req.user = { id: 'user-tourist', role: 'USER' };
    }
    return true;
  }
}

describe('Phase 5 Acceptance Tests (e2e)', () => {
  let app: INestApplication;

  // In-memory data store for stateful integration flows
  const store = {
    creators: new Map<string, any>(),
    bookings: new Map<string, any>(),
    availabilities: new Map<string, any>(),
    incidents: new Map<string, any>(),
    webhookEvents: new Map<string, any>(),
    reviews: new Map<string, any>(),
  };

  // Setup initial fixture data
  beforeEach(() => {
    store.creators.clear();
    store.bookings.clear();
    store.availabilities.clear();
    store.incidents.clear();
    store.webhookEvents.clear();
    store.reviews.clear();

    // Fixture: Unverified Creator
    store.creators.set('user-unverified', {
      id: 'creator-unverified-1',
      userId: 'user-unverified',
      verified: false,
      creatorStatus: 'PENDING',
      district: 'Bastar',
    });

    // Fixture: Verified Creator
    store.creators.set('user-verified', {
      id: 'creator-verified-1',
      userId: 'user-verified',
      verified: true,
      creatorStatus: 'VERIFIED',
      district: 'Raipur',
    });

    // Fixture: Product Availability with Capacity = 1
    store.availabilities.set('00000000-0000-4000-8000-000000000002', {
      id: '00000000-0000-4000-8000-000000000002',
      productId: '00000000-0000-4000-8000-000000000001',
      capacity: 1,
      reserved: 0,
      startAt: new Date(Date.now() + 86400000), // tomorrow
    });

    // Fixture: Completed Booking for Review
    store.bookings.set('booking-completed-1', {
      id: 'booking-completed-1',
      userId: 'user-tourist',
      placeId: 'place-chitrakote',
      status: 'COMPLETED',
      paymentStatus: PaymentStatus.PAID,
      review: null,
      place: { id: 'place-chitrakote' },
    });

    // Fixture: Payment Pending Booking
    store.bookings.set('booking-pending-1', {
      id: 'booking-pending-1',
      userId: 'user-tourist',
      placeId: 'place-chitrakote',
      productId: 'prod-safari-1',
      status: 'PAYMENT_PENDING',
      paymentStatus: PaymentStatus.UNPAID,
      totalAmount: 1500,
      currency: 'INR',
      review: null,
      place: { id: 'place-chitrakote' },
    });
  });

  const mockPrisma: any = {
    creatorProfile: {
      findUnique: jest.fn(({ where }: any) => {
        if (where.userId) return Promise.resolve(store.creators.get(where.userId) || null);
        if (where.id) {
          for (const c of store.creators.values()) {
            if (c.id === where.id) return Promise.resolve(c);
          }
        }
        return Promise.resolve(null);
      }),
      create: jest.fn(({ data }: any) => {
        const id = `creator-${Date.now()}`;
        const item = { id, ...data };
        store.creators.set(data.userId, item);
        return Promise.resolve(item);
      }),
      update: jest.fn(({ where, data }: any) => {
        for (const [uid, c] of store.creators.entries()) {
          if (c.id === where.id) {
            const updated = { ...c, ...data };
            store.creators.set(uid, updated);
            return Promise.resolve(updated);
          }
        }
        return Promise.resolve(null);
      }),
    },
    creatorContent: {
      create: jest.fn(({ data }: any) => {
        return Promise.resolve({ id: `content-${Date.now()}`, ...data });
      }),
    },
    creatorVideo: {
      create: jest.fn(({ data }: any) => {
        return Promise.resolve({ id: `video-${Date.now()}`, ...data });
      }),
    },
    place: {
      findUnique: jest.fn(({ where }: any) => {
        return Promise.resolve({
          id: where.id,
          name: 'Chitrakote Waterfalls',
          district: 'Bastar',
          bookingEnabled: true,
          bookingPricePaise: 50000,
          bookingMaxGuests: 10,
        });
      }),
    },
    tourismProduct: {
      findUnique: jest.fn(({ where }: any) => {
        return Promise.resolve({
          id: where.id,
          partnerId: 'partner-1',
          active: true,
          price: 1500,
          currency: 'INR',
          partner: {
            id: 'partner-1',
            status: PartnerStatus.VERIFIED,
          },
          policy: null,
        });
      }),
    },
    productAvailability: {
      findUnique: jest.fn(({ where }: any) => {
        return Promise.resolve(store.availabilities.get(where.id) || null);
      }),
      update: jest.fn(({ where, data }: any) => {
        const item = store.availabilities.get(where.id);
        if (item) {
          if (data.reserved?.increment) {
            item.reserved += data.reserved.increment;
          }
          return Promise.resolve(item);
        }
        return Promise.resolve(null);
      }),
      updateMany: jest.fn(({ where, data }: any) => {
        const item = store.availabilities.get(where.id);
        if (!item) return Promise.resolve({ count: 0 });
        const maxAllowed = where.reserved?.lte ?? (item.capacity - (data.reserved?.increment || 1));
        if (item.reserved <= maxAllowed && item.reserved + (data.reserved?.increment || 1) <= item.capacity) {
          item.reserved += data.reserved.increment;
          return Promise.resolve({ count: 1 });
        }
        return Promise.resolve({ count: 0 });
      }),
    },
    booking: {
      findUnique: jest.fn(({ where }: any) => {
        return Promise.resolve(store.bookings.get(where.id) || null);
      }),
      create: jest.fn(({ data }: any) => {
        const id = `booking-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const item = { id, ...data };
        store.bookings.set(id, item);
        return Promise.resolve(item);
      }),
      update: jest.fn(({ where, data }: any) => {
        const item = store.bookings.get(where.id);
        if (item) {
          const updated = { ...item, ...data };
          store.bookings.set(where.id, updated);
          return Promise.resolve(updated);
        }
        return Promise.resolve(null);
      }),
      findMany: jest.fn(() => Promise.resolve(Array.from(store.bookings.values()))),
    },
    partnerCommission: {
      create: jest.fn(({ data }: any) => Promise.resolve({ id: 'comm-1', ...data })),
    },
    commerceAuditLog: {
      create: jest.fn(({ data }: any) => Promise.resolve({ id: 'cal-1', ...data })),
    },
    analyticsEvent: {
      create: jest.fn(({ data }: any) => Promise.resolve({ id: 'evt-1', ...data })),
    },
    review: {
      findUnique: jest.fn(({ where }: any) => Promise.resolve(store.reviews.get(where.bookingId) || null)),
      findFirst: jest.fn(({ where }: any) => Promise.resolve(store.reviews.get(where.bookingId) || null)),
      create: jest.fn(({ data }: any) => {
        const item = { id: `rev-${Date.now()}`, ...data, user: { fullName: 'Tourist User', avatar: null } };
        store.reviews.set(data.bookingId, item);
        return Promise.resolve(item);
      }),
      findMany: jest.fn(() => Promise.resolve(Array.from(store.reviews.values()))),
    },
    paymentWebhookEvent: {
      findUnique: jest.fn(({ where }: any) => {
        const key = `${where.provider_eventId.provider}:${where.provider_eventId.eventId}`;
        return Promise.resolve(store.webhookEvents.get(key) || null);
      }),
      create: jest.fn(({ data }: any) => {
        const key = `${data.provider}:${data.eventId}`;
        store.webhookEvents.set(key, data);
        return Promise.resolve(data);
      }),
    },
    emergencyStation: {
      findMany: jest.fn(() =>
        Promise.resolve([
          {
            id: 'station-1',
            name: 'Jagdalpur Emergency HQ',
            phone: '+917782222100',
            type: 'POLICE',
            district: 'Bastar',
            division: 'Bastar',
            latitude: 19.076,
            longitude: 82.021,
            active: true,
            priority: 10,
            capabilities: '["AMBULANCE", "SEARCH_RESCUE"]',
            notes: null,
          },
        ]),
      ),
    },
    emergencyIncident: {
      create: jest.fn(({ data }: any) => {
        const id = `inc-${Date.now()}`;
        const item = { id, ...data, createdAt: new Date() };
        store.incidents.set(id, item);
        return Promise.resolve(item);
      }),
      findUnique: jest.fn(({ where }: any) => Promise.resolve(store.incidents.get(where.id) || null)),
      findMany: jest.fn(() => Promise.resolve(Array.from(store.incidents.values()))),
      update: jest.fn(({ where, data }: any) => {
        const item = store.incidents.get(where.id);
        if (item) {
          const updated = { ...item, ...data };
          store.incidents.set(where.id, updated);
          return Promise.resolve(updated);
        }
        return Promise.resolve(null);
      }),
    },
    outboxEvent: {
      create: jest.fn(({ data }: any) => Promise.resolve({ id: 'out-1', ...data })),
      findMany: jest.fn(() => Promise.resolve([])),
      update: jest.fn(({ where, data }: any) => Promise.resolve({ id: where.id, ...data })),
    },
    auditLog: {
      create: jest.fn(({ data }: any) => Promise.resolve({ id: 'aud-1', ...data })),
      findMany: jest.fn(() => Promise.resolve([])),
    },
    $transaction: jest.fn((cb: any) => cb(mockPrisma)),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        CommunityModule,
        ReviewsModule,
        BookingsModule,
        PaymentsModule,
        EmergencyModule,
        OutboxModule,
        AuditModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
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

  // ---------------------------------------------------------------------------
  // TEST A: Unverified Creator Rejection
  // ---------------------------------------------------------------------------
  describe('Test A — Unverified Creator Content Submission', () => {
    it('rejects unverified creator publication with 403 Forbidden', async () => {
      const res = await request(app.getHttpServer())
        .post('/community/content')
        .set('Authorization', 'Bearer unverified-creator')
        .send({
          type: 'STORY',
          title: 'Unverified Tourist Story',
          description: 'This should be blocked',
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('A verified creator profile is required');
    });

    it('allows verified creator to submit content for moderation with 201 Created', async () => {
      const res = await request(app.getHttpServer())
        .post('/community/content')
        .set('Authorization', 'Bearer verified-creator')
        .send({
          type: 'STORY',
          title: 'Bastar Art Exploration',
          description: 'Deep dive into Dokra art',
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Bastar Art Exploration');
      expect(res.body.status).toBe('MODERATION');
      expect(res.body.moderationStatus).toBe('PENDING');
    });
  });

  // ---------------------------------------------------------------------------
  // TEST B: Invalid Review Rejection
  // ---------------------------------------------------------------------------
  describe('Test B — Review Rating Validation (1 to 5)', () => {
    it('rejects review with rating = 0 with 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', 'Bearer tourist')
        .send({
          placeId: '00000000-0000-0000-0000-000000000001',
          bookingId: '00000000-0000-0000-0000-000000000002',
          rating: 0,
          comment: 'This was terrible but rating 0 is not allowed.',
        });

      expect(res.status).toBe(400);
    });

    it('rejects review with rating = 6 with 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', 'Bearer tourist')
        .send({
          placeId: '00000000-0000-0000-0000-000000000001',
          bookingId: '00000000-0000-0000-0000-000000000002',
          rating: 6,
          comment: 'Too good to be 5 stars, attempting rating 6.',
        });

      expect(res.status).toBe(400);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST C: Double Booking Concurrency Protection
  // ---------------------------------------------------------------------------
  describe('Test C — Double Booking Atomic Concurrency Protection', () => {
    it('allows first booking and rejects second concurrent booking with 409 Conflict', async () => {
      const payload = {
        productId: '00000000-0000-4000-8000-000000000001',
        availabilityId: '00000000-0000-4000-8000-000000000002',
        quantity: 1,
        contactPhone: '+919876543210',
      };

      // Request 1 arrives for slot with capacity 1
      const res1 = await request(app.getHttpServer())
        .post('/bookings/marketplace')
        .set('Authorization', 'Bearer tourist')
        .send(payload);

      expect(res1.status).toBe(201);
      expect(res1.body.success).toBe(true);

      // Request 2 arrives simultaneously/subsequently for the now-exhausted slot
      const res2 = await request(app.getHttpServer())
        .post('/bookings/marketplace')
        .set('Authorization', 'Bearer tourist')
        .send(payload);

      expect(res2.status).toBe(409);
      expect(res2.body.message).toMatch(/capacity/i);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST D: Fake Client Payment Status Ignored
  // ---------------------------------------------------------------------------
  describe('Test D — Fake Client Payment Status Handling', () => {
    it('ignores client reporting "PAID" and leaves booking in PAYMENT_PENDING', async () => {
      const res = await request(app.getHttpServer())
        .post('/payments/client-report')
        .set('Authorization', 'Bearer tourist')
        .send({
          bookingId: 'booking-pending-1',
          status: 'PAID',
        });

      expect(res.status).toBe(201);
      expect(res.body.verified).toBe(false);
      expect(res.body.status).toBe('PAYMENT_PENDING');

      // Verify booking state in database remained PAYMENT_PENDING
      const booking = store.bookings.get('booking-pending-1');
      expect(booking.status).toBe('PAYMENT_PENDING');
      expect(booking.paymentStatus).toBe(PaymentStatus.UNPAID);
    });

    it('rejects attempt to complete a booking that is not confirmed', async () => {
      const res = await request(app.getHttpServer())
        .post('/bookings/booking-pending-1/complete')
        .set('Authorization', 'Bearer tourist');

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Only confirmed bookings can be completed');
    });
  });

  // ---------------------------------------------------------------------------
  // TEST E: Invalid Webhook Signature Rejection
  // ---------------------------------------------------------------------------
  describe('Test E — Invalid Webhook Signature Verification', () => {
    it('rejects webhook with invalid signature with 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post('/payments/webhook')
        .set('x-webhook-signature', 'sig_invalid_forged_hash')
        .send({
          event: 'payment.succeeded',
          paymentIntentId: 'pi_test_123',
          bookingId: 'booking-pending-1',
          amount: 1500,
          status: 'PAID',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid webhook signature');

      // Booking must remain unchanged
      const booking = store.bookings.get('booking-pending-1');
      expect(booking.status).toBe('PAYMENT_PENDING');
    });
  });

  // ---------------------------------------------------------------------------
  // TEST F: Duplicate Webhook Idempotency
  // ---------------------------------------------------------------------------
  describe('Test F — Duplicate Webhook Idempotency', () => {
    it('processes valid webhook once and safely ignores duplicate delivery', async () => {
      const webhookPayload = {
        event: 'payment.succeeded',
        paymentIntentId: 'pi_idem_999',
        bookingId: 'booking-pending-1',
        amount: 1500,
        status: 'PAID',
        eventId: 'evt_unique_101',
      };

      // First webhook delivery
      const res1 = await request(app.getHttpServer())
        .post('/payments/webhook')
        .set('x-webhook-signature', 'sig_valid_authorized')
        .send(webhookPayload);

      expect(res1.status).toBe(201);
      expect(res1.body.received).toBe(true);
      expect(res1.body.idempotent).toBeUndefined();

      // Booking transitioned to CONFIRMED and PAID
      const bookingAfter1 = store.bookings.get('booking-pending-1');
      expect(bookingAfter1.status).toBe('CONFIRMED');
      expect(bookingAfter1.paymentStatus).toBe(PaymentStatus.PAID);

      // Duplicate webhook delivery with identical eventId
      const res2 = await request(app.getHttpServer())
        .post('/payments/webhook')
        .set('x-webhook-signature', 'sig_valid_authorized')
        .send(webhookPayload);

      expect(res2.status).toBe(201);
      expect(res2.body.received).toBe(true);
      expect(res2.body.idempotent).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST G: Emergency Incident State Machine
  // ---------------------------------------------------------------------------
  describe('Test G — Emergency Incident Lifecycle State Machine', () => {
    it('creates incident and progresses through state machine to RESOLVED', async () => {
      // 1. TRIGGERED via SOS
      const res = await request(app.getHttpServer())
        .post('/emergency/incidents')
        .set('Authorization', 'Bearer tourist')
        .send({
          latitude: 19.076,
          longitude: 82.021,
          type: 'MEDICAL',
          severity: 'CRITICAL',
          description: 'Tourist slipped near waterfall trail',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('TRIGGERED');
      expect(res.body.incidentNumber).toMatch(/^INC-/);
      expect(res.body.primaryResponder).toBeDefined();
      const incidentId = res.body.id;

      // 2. ACKNOWLEDGED
      const ackRes = await request(app.getHttpServer())
        .patch(`/emergency/incidents/${incidentId}/status`)
        .set('Authorization', 'Bearer responder')
        .send({ status: 'ACKNOWLEDGED' });
      expect(ackRes.status).toBe(200);
      expect(ackRes.body.status).toBe('ACKNOWLEDGED');

      // 3. DISPATCHED
      const dispRes = await request(app.getHttpServer())
        .patch(`/emergency/incidents/${incidentId}/status`)
        .set('Authorization', 'Bearer responder')
        .send({ status: 'DISPATCHED' });
      expect(dispRes.status).toBe(200);
      expect(dispRes.body.status).toBe('DISPATCHED');

      // 4. RESPONDING
      const respRes = await request(app.getHttpServer())
        .patch(`/emergency/incidents/${incidentId}/status`)
        .set('Authorization', 'Bearer responder')
        .send({ status: 'RESPONDING' });
      expect(respRes.status).toBe(200);
      expect(respRes.body.status).toBe('RESPONDING');

      // 5. ON_SCENE
      const sceneRes = await request(app.getHttpServer())
        .patch(`/emergency/incidents/${incidentId}/status`)
        .set('Authorization', 'Bearer responder')
        .send({ status: 'ON_SCENE' });
      expect(sceneRes.status).toBe(200);
      expect(sceneRes.body.status).toBe('ON_SCENE');

      // 6. RESOLVED by authorized responder
      const resolveRes = await request(app.getHttpServer())
        .post(`/emergency/incidents/${incidentId}/resolve`)
        .set('Authorization', 'Bearer responder');

      expect(resolveRes.status).toBe(201);
      expect(resolveRes.body.status).toBe('RESOLVED');
      expect(resolveRes.body.resolvedAt).toBeDefined();

      // 7. Resolved incident cannot be further modified
      const attemptRes = await request(app.getHttpServer())
        .patch(`/emergency/incidents/${incidentId}/status`)
        .set('Authorization', 'Bearer responder')
        .send({ status: 'TRIGGERED' });
      expect(attemptRes.status).toBe(400);
      expect(attemptRes.body.message).toContain('Resolved emergency incident cannot be modified');
    });
  });

  // ---------------------------------------------------------------------------
  // TEST H: Unauthorized Emergency Incident Resolution
  // ---------------------------------------------------------------------------
  describe('Test H — Unauthorized Emergency Incident Resolution Rejection', () => {
    it('rejects ordinary tourist resolution with 403 Forbidden', async () => {
      // Create fresh incident
      const createRes = await request(app.getHttpServer())
        .post('/emergency/incidents')
        .set('Authorization', 'Bearer tourist')
        .send({
          latitude: 19.123,
          longitude: 81.987,
          type: 'LOST',
          severity: 'HIGH',
          description: 'Hiker lost off path',
        });
      const incidentId = createRes.body.id;

      // Ordinary tourist tries to resolve
      const res = await request(app.getHttpServer())
        .post(`/emergency/incidents/${incidentId}/resolve`)
        .set('Authorization', 'Bearer tourist');

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Only authorized emergency responders or administrators');
    });
  });
});
