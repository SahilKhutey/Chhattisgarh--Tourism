import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { PrismaService } from '../../database/prisma.service';

describe('RoutesService', () => {
  let service: RoutesService;
  let prisma: {
    route: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      route: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RoutesService>(RoutesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('returns all routes ordered by name', async () => {
      const mockRoutes = [{ id: 'r-1', name: 'Bastar Tribal Circuit', slug: 'bastar-tribal-circuit' }];
      prisma.route.findMany.mockResolvedValue(mockRoutes);

      const result = await service.list();
      expect(result).toEqual(mockRoutes);
      expect(prisma.route.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          zone: true,
          places: {
            orderBy: { sequence: 'asc' },
            include: {
              place: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  latitude: true,
                  longitude: true,
                  district: true,
                },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      });
    });

    it('filters routes by zone slug', async () => {
      prisma.route.findMany.mockResolvedValue([]);
      await service.list('bastar-zone');
      expect(prisma.route.findMany).toHaveBeenCalledWith({
        where: { zone: { slug: 'bastar-zone' } },
        include: expect.any(Object),
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('getBySlug', () => {
    it('returns route when found', async () => {
      const mockRoute = { id: 'r-1', slug: 'bastar-tribal-circuit', name: 'Bastar Circuit' };
      prisma.route.findUnique.mockResolvedValue(mockRoute);

      const result = await service.getBySlug('bastar-tribal-circuit');
      expect(result).toEqual(mockRoute);
    });

    it('throws NotFoundException when route not found', async () => {
      prisma.route.findUnique.mockResolvedValue(null);

      await expect(service.getBySlug('unknown-circuit')).rejects.toThrow(NotFoundException);
    });
  });
});
