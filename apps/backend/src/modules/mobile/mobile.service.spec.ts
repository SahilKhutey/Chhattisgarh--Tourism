import { Test } from '@nestjs/testing';
import { MobileService } from './mobile.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('MobileService', () => {
  const prismaMock = {
    mobileDevice: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  let service: MobileService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MobileService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<MobileService>(MobileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('registers a new device token for authenticated user', async () => {
    prismaMock.mobileDevice.findUnique.mockResolvedValue(null);
    prismaMock.mobileDevice.create.mockResolvedValue({
      id: 'device-1',
      platform: 'android',
      appVersion: '1.0.0',
      active: true,
      lastSeenAt: new Date(),
    });

    const result = await service.registerDevice('user-1', {
      deviceToken: '123456789012345678901234567890',
      platform: 'android',
      appVersion: '1.0.0',
      deviceId: 'hw-1',
    });

    expect(prismaMock.mobileDevice.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        deviceToken: '123456789012345678901234567890',
        platform: 'android',
        appVersion: '1.0.0',
        deviceId: 'hw-1',
      },
      select: {
        id: true,
        platform: true,
        appVersion: true,
        active: true,
        lastSeenAt: true,
      },
    });
    expect(result.active).toBe(true);
    expect(result.platform).toBe('android');
  });

  it('updates an existing device record on token refresh', async () => {
    prismaMock.mobileDevice.findUnique.mockResolvedValue({
      id: 'device-1',
      deviceToken: '123456789012345678901234567890',
    });
    prismaMock.mobileDevice.update.mockResolvedValue({
      id: 'device-1',
      platform: 'ios',
      appVersion: '1.0.1',
      active: true,
      lastSeenAt: new Date(),
    });

    const result = await service.registerDevice('user-1', {
      deviceToken: '123456789012345678901234567890',
      platform: 'ios',
      appVersion: '1.0.1',
    });

    expect(prismaMock.mobileDevice.update).toHaveBeenCalled();
    expect(result.platform).toBe('ios');
  });

  it('unregisters device and deactivates push token', async () => {
    prismaMock.mobileDevice.findUnique.mockResolvedValue({
      id: 'device-1',
      userId: 'user-1',
      deviceToken: '123456789012345678901234567890',
      active: true,
    });
    prismaMock.mobileDevice.update.mockResolvedValue({
      id: 'device-1',
      active: false,
    });

    const result = await service.unregisterDevice('user-1', '123456789012345678901234567890');
    expect(prismaMock.mobileDevice.update).toHaveBeenCalledWith({
      where: { deviceToken: '123456789012345678901234567890' },
      data: { active: false },
    });
    expect(result.success).toBe(true);
  });

  it('throws NotFoundException when unregistering device not belonging to user', async () => {
    prismaMock.mobileDevice.findUnique.mockResolvedValue({
      id: 'device-1',
      userId: 'other-user',
      deviceToken: 'token-abc',
    });

    await expect(service.unregisterDevice('user-1', 'token-abc')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('formats push notification payloads for cross-platform delivery', () => {
    const payload = service.formatPushPayload({
      title: 'Monsoon Alert: Bastar',
      body: 'Heavy rainfall expected near Chitrakote falls today.',
      data: { alertId: 'alert-1', severity: 'WARNING' },
    });

    expect(payload.notification.title).toBe('Monsoon Alert: Bastar');
    expect(payload.notification.body).toBe('Heavy rainfall expected near Chitrakote falls today.');
    expect(payload.android.priority).toBe('high');
    expect(payload.android.notification.channelId).toBe('cg_tourism_alerts');
    expect(payload.apns.payload.aps.alert.title).toBe('Monsoon Alert: Bastar');
    expect(payload.data.alertId).toBe('alert-1');
  });

  it('dispatches notification to all active devices of a user', async () => {
    prismaMock.mobileDevice.findMany.mockResolvedValue([
      { id: 'd-1', deviceToken: 'token-android-1', platform: 'android', appVersion: '1.0.0', lastSeenAt: new Date() },
      { id: 'd-2', deviceToken: 'token-ios-1', platform: 'ios', appVersion: '1.0.0', lastSeenAt: new Date() },
    ]);

    const result = await service.dispatchNotificationToUser('user-1', {
      title: 'Booking Confirmed',
      body: 'Your Bastar homestay booking is confirmed!',
      data: { bookingId: 'bk-123' },
    });

    expect(result.dispatchedCount).toBe(2);
    expect(result.deviceTokens).toEqual(['token-android-1', 'token-ios-1']);
    expect(result.payload.notification.title).toBe('Booking Confirmed');
  });
});

