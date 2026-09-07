import { Test, TestingModule } from '@nestjs/testing';

import { BadRequestException } from '@nestjs/common';

import { EmergencyService } from './emergency.service';
import { EmergencyDispatcher } from './emergency.dispatcher';
import { PrismaService } from '../../database/prisma.service';

describe('EmergencyService', () => {
  let service: EmergencyService;

  let prismaMock: {
    emergencyStation: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };

    emergencyAlert: {
      create: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
  };

  let dispatcherMock: {
    dispatch: jest.Mock;
  };

  beforeEach(async () => {
    prismaMock = {
      emergencyStation: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },

      emergencyAlert: {
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    };

    dispatcherMock = {
      dispatch: jest.fn().mockResolvedValue({
        primaryDispatched: true,
        backupsDispatched: 3,
        provider: 'PLATFORM_DISPATCH_QUEUE',
      }),
    };

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          EmergencyService,

          {
            provide: PrismaService,
            useValue: prismaMock,
          },

          {
            provide: EmergencyDispatcher,
            useValue: dispatcherMock,
          },
        ],
      }).compile();

    service =
      module.get<EmergencyService>(
        EmergencyService,
      );
  });

  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================

  it('should initialize', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // HAVERSINE
  // ===========================================================================

  describe('calculateDistance', () => {
    it('returns zero for identical coordinates', () => {
      const distance =
        service.calculateDistance(
          21.2514,
          81.6296,
          21.2514,
          81.6296,
        );

      expect(distance).toBeCloseTo(0, 5);
    });

    it('calculates Raipur-Bilaspur distance', () => {
      const distance =
        service.calculateDistance(
          21.2787,
          81.6296,
          22.079,
          82.1391,
        );

      expect(distance).toBeGreaterThan(100);
      expect(distance).toBeLessThan(105);
    });

    it('is approximately symmetric', () => {
      const forward =
        service.calculateDistance(
          19.2,
          81.7,
          22.02,
          81.26,
        );

      const reverse =
        service.calculateDistance(
          22.02,
          81.26,
          19.2,
          81.7,
        );

      expect(forward).toBeCloseTo(reverse, 8);
    });
  });

  // ===========================================================================
  // COORDINATE VALIDATION
  // ===========================================================================

  describe('coordinate validation', () => {
    it('rejects invalid latitude', async () => {
      await expect(
        service.triggerSos({
          latitude: 100,
          longitude: 81,
          touristName: 'Test Tourist',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects invalid longitude', async () => {
      await expect(
        service.triggerSos({
          latitude: 21,
          longitude: 200,
          touristName: 'Test Tourist',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ===========================================================================
  // SOS
  // ===========================================================================

  describe('triggerSos', () => {
    const stations = [
      {
        id: 'station-1',
        name: 'Bastar Ranger',
        phone: '+91-111',
        type: 'RANGER',
        district: 'Bastar',
        division: 'Bastar',
        latitude: 19.2,
        longitude: 81.7,
        active: true,
        priority: 100,
        capabilities: '["FOREST_RESCUE"]',
        notes: null,
      },

      {
        id: 'station-2',
        name: 'Bastar Hospital',
        phone: '+91-222',
        type: 'HOSPITAL',
        district: 'Bastar',
        division: 'Bastar',
        latitude: 19.21,
        longitude: 81.71,
        active: true,
        priority: 90,
        capabilities: '["MEDICAL"]',
        notes: null,
      },

      {
        id: 'station-3',
        name: 'Bastar Police',
        phone: '+91-333',
        type: 'POLICE',
        district: 'Bastar',
        division: 'Bastar',
        latitude: 19.22,
        longitude: 81.72,
        active: true,
        priority: 80,
        capabilities: '["POLICE"]',
        notes: null,
      },

      {
        id: 'station-4',
        name: 'Bastar Backup',
        phone: '+91-444',
        type: 'RANGER',
        district: 'Bastar',
        division: 'Bastar',
        latitude: 19.23,
        longitude: 81.73,
        active: true,
        priority: 70,
        capabilities: '[]',
        notes: null,
      },

      {
        id: 'station-5',
        name: 'Bastar Backup 2',
        phone: '+91-555',
        type: 'POLICE',
        district: 'Bastar',
        division: 'Bastar',
        latitude: 19.24,
        longitude: 81.74,
        active: true,
        priority: 60,
        capabilities: '[]',
        notes: null,
      },
    ];

    beforeEach(() => {
      prismaMock.emergencyStation.findMany.mockResolvedValue(
        stations,
      );

      prismaMock.emergencyAlert.create.mockResolvedValue({
        id: 'alert-db-1',
        alertId: 'sos-test',
      });
    });

    it('selects the nearest active station', async () => {
      const result =
        await service.triggerSos({
          latitude: 19.2001,
          longitude: 81.7001,
          touristName: 'Devendra Mandavi',
        });

      expect(result.success).toBe(true);

      expect(
        result.primaryResponder.name,
      ).toBe('Bastar Ranger');

      expect(
        result.primaryResponder.distanceKm,
      ).toBeLessThan(1);
    });

    it('selects three backup responders', async () => {
      const result =
        await service.triggerSos({
          latitude: 19.2001,
          longitude: 81.7001,
          touristName: 'Tourist',
        });

      expect(
        result.backupResponders,
      ).toHaveLength(3);
    });

    it('only queries active stations', async () => {
      await service.triggerSos({
        latitude: 19.2,
        longitude: 81.7,
        touristName: 'Tourist',
      });

      expect(
        prismaMock.emergencyStation.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            active: true,
          },
        }),
      );
    });

    it('persists the selected primary responder', async () => {
      await service.triggerSos({
        latitude: 19.2,
        longitude: 81.7,
        touristName: 'Tourist',
      });

      expect(
        prismaMock.emergencyAlert.create,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            primaryResponder: 'Bastar Ranger',
            primaryResponderId: 'station-1',
          }),
        }),
      );
    });

    it('calls the dispatcher', async () => {
      await service.triggerSos({
        latitude: 19.2,
        longitude: 81.7,
        touristName: 'Tourist',
      });

      expect(
        dispatcherMock.dispatch,
      ).toHaveBeenCalledTimes(1);
    });

    it('rejects SOS when no station exists', async () => {
      prismaMock.emergencyStation.findMany.mockResolvedValue(
        [],
      );

      await expect(
        service.triggerSos({
          latitude: 19.2,
          longitude: 81.7,
          touristName: 'Tourist',
        }),
      ).rejects.toThrow(
        'No active emergency responder stations are currently configured.',
      );
    });
  });

  // ===========================================================================
  // HELPLINES
  // ===========================================================================

  describe('getHelplines', () => {
    it('returns active stations', async () => {
      prismaMock.emergencyStation.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'Station',
          phone: '+91-1',
          type: 'POLICE',
          district: 'Bastar',
          division: 'Bastar',
          latitude: 19,
          longitude: 81,
          active: true,
          priority: 1,
          capabilities: '[]',
          notes: null,
        },
      ]);

      const result =
        await service.getHelplines();

      expect(result).toHaveLength(1);

      expect(result[0].district).toBe(
        'Bastar',
      );
    });

    it('filters by district', async () => {
      prismaMock.emergencyStation.findMany.mockResolvedValue(
        [],
      );

      await service.getHelplines('Bastar');

      expect(
        prismaMock.emergencyStation.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            active: true,
            district: {
              equals: 'Bastar',
            },
          },
        }),
      );
    });
  });

  // ===========================================================================
  // ADMIN CRUD
  // ===========================================================================

  describe('station management', () => {
    const station = {
      id: 'station-1',
      name: 'Test Station',
      phone: '+91-123',
      type: 'POLICE',
      district: 'Raipur',
      division: 'Raipur',
      latitude: 21.25,
      longitude: 81.63,
      active: true,
      priority: 100,
      capabilities: '["POLICE"]',
      notes: null,
    };

    it('creates a station', async () => {
      prismaMock.emergencyStation.create.mockResolvedValue(
        station,
      );

      const result =
        await service.createStation({
          name: 'Test Station',
          phone: '+91-123',
          type: 'POLICE',
          district: 'Raipur',
          division: 'Raipur',
          latitude: 21.25,
          longitude: 81.63,
          priority: 100,
          capabilities: ['POLICE'],
        });

      expect(result.id).toBe('station-1');

      expect(
        prismaMock.emergencyStation.create,
      ).toHaveBeenCalled();
    });

    it('updates a station', async () => {
      prismaMock.emergencyStation.findUnique.mockResolvedValue(
        station,
      );

      prismaMock.emergencyStation.update.mockResolvedValue({
        ...station,
        phone: '+91-999',
      });

      const result =
        await service.updateStation(
          'station-1',
          {
            phone: '+91-999',
          },
        );

      expect(result.phone).toBe('+91-999');
    });

    it('rejects update for unknown station', async () => {
      prismaMock.emergencyStation.findUnique.mockResolvedValue(
        null,
      );

      await expect(
        service.updateStation(
          'missing',
          {
            phone: '+91-999',
          },
        ),
      ).rejects.toThrow(
        'Emergency station not found.',
      );
    });

    it('prevents deleting stations with alert history', async () => {
      prismaMock.emergencyStation.findUnique.mockResolvedValue(
        station,
      );

      prismaMock.emergencyAlert.count.mockResolvedValue(1);

      await expect(
        service.deleteStation('station-1'),
      ).rejects.toThrow(
        'Station has emergency alert history.',
      );
    });
  });
});
