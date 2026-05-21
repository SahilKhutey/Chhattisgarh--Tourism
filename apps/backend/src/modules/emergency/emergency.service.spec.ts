import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyService } from './emergency.service';
import { PrismaService } from '../../database/prisma.service';

describe('EmergencyService Unit Tests', () => {
  let service: EmergencyService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      emergencyAlert: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmergencyService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<EmergencyService>(EmergencyService);
  });

  it('should be successfully initialized', () => {
    expect(service).toBeDefined();
  });

  describe('calculateDistance math verification', () => {
    it('should compute exact trigonometric coordinates distance correctly', () => {
      // Coordinates of Raipur (21.2787, 81.6296) and Bilaspur (22.0790, 82.1391)
      // Standard Haversine distance is roughly 102.5 km
      const distance = (service as any).calculateDistance(21.2787, 81.6296, 22.0790, 82.1391);
      expect(distance).toBeGreaterThan(100);
      expect(distance).toBeLessThan(105);
    });
  });

  describe('triggerSos operations dispatch', () => {
    it('should sort regional rescue responders and match the nearest ranger desk', async () => {
      // Alert triggered near Bastar (19.2000, 81.7000)
      const alertPayload = {
        latitude: 19.2005,
        longitude: 81.6998,
        touristName: 'Devendra Mandavi',
        touristPhone: '+91-99999-88888',
        medicalNotes: 'Safe path evacuations required.',
      };

      const result = await service.triggerSos(alertPayload);

      expect(result.success).toBe(true);
      expect(result.status).toBe('DISPATCHED_IMMEDIATELY');
      expect(result.primaryResponder.name).toContain('Bastar Forest Ranger');
      expect(result.primaryResponder.distanceKm).toBeLessThan(2);
      expect(result.backupResponders.length).toBe(3);
    });
  });

  describe('getHelplines filters tests', () => {
    it('should return helplines filtered by district correctly', async () => {
      const bastarHelplines = await service.getHelplines('Bastar');
      expect(bastarHelplines.length).toBe(4);
      expect(bastarHelplines[0].district).toBe('Bastar');

      const surgujaHelplines = await service.getHelplines('Surguja');
      expect(surgujaHelplines.length).toBe(2);
      expect(surgujaHelplines[0].district).toBe('Surguja');
    });
  });
});
