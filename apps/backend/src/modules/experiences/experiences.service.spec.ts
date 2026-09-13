import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { PrismaService } from '../../database/prisma.service';

describe('ExperiencesService', () => {
  let service: ExperiencesService;
  let prisma: {
    experience: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      experience: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperiencesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ExperiencesService>(ExperiencesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('returns active experiences', async () => {
      const mockExperiences = [
        { id: 'exp-1', title: 'Boating at Chitrakote', slug: 'boating-chitrakote' },
      ];
      prisma.experience.findMany.mockResolvedValue(mockExperiences);

      const result = await service.list();
      expect(result).toEqual(mockExperiences);
      expect(prisma.experience.findMany).toHaveBeenCalledWith({
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
        orderBy: { createdAt: 'desc' },
      });
    });

    it('filters by place slug when provided', async () => {
      prisma.experience.findMany.mockResolvedValue([]);
      await service.list('chitrakote-waterfalls');
      expect(prisma.experience.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          place: { slug: 'chitrakote-waterfalls' },
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getBySlug', () => {
    it('returns experience when found', async () => {
      const mockExp = { id: 'exp-1', slug: 'boating-chitrakote', title: 'Boating' };
      prisma.experience.findUnique.mockResolvedValue(mockExp);

      const result = await service.getBySlug('boating-chitrakote');
      expect(result).toEqual(mockExp);
    });

    it('throws NotFoundException when experience not found', async () => {
      prisma.experience.findUnique.mockResolvedValue(null);

      await expect(service.getBySlug('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
