import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TourismServicesService } from './tourism-services.service';
import { PrismaService } from '../../database/prisma.service';

describe('TourismServicesService', () => {
  let service: TourismServicesService;
  let prisma: {
    tourismService: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      tourismService: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TourismServicesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TourismServicesService>(TourismServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('returns active tourism services', async () => {
      const mockServices = [
        { id: 'srv-1', name: 'Dandami Luxury Resort', serviceType: 'ACCOMMODATION' },
      ];
      prisma.tourismService.findMany.mockResolvedValue(mockServices);

      const result = await service.list();
      expect(result).toEqual(mockServices);
      expect(prisma.tourismService.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          place: {
            select: {
              id: true,
              name: true,
              slug: true,
              district: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });
    });

    it('filters by place slug when provided', async () => {
      prisma.tourismService.findMany.mockResolvedValue([]);
      await service.list('chitrakote-waterfalls');
      expect(prisma.tourismService.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          place: { slug: 'chitrakote-waterfalls' },
        },
        include: expect.any(Object),
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('getById', () => {
    it('returns service when found', async () => {
      const mockSrv = { id: 'srv-1', name: 'Dandami Resort' };
      prisma.tourismService.findUnique.mockResolvedValue(mockSrv);

      const result = await service.getById('srv-1');
      expect(result).toEqual(mockSrv);
    });

    it('throws NotFoundException when service not found', async () => {
      prisma.tourismService.findUnique.mockResolvedValue(null);

      await expect(service.getById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
