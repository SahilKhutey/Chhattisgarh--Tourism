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
});
