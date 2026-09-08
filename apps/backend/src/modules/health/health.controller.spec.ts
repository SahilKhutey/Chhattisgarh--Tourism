import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaService } from '../../database/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: HealthService;

  const mockPrisma = {
    $queryRaw: jest.fn(),
  };

  const createMockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get<HealthService>(HealthService);
    jest.clearAllMocks();
  });

  describe('getLiveness', () => {
    it('returns status ok with uptime and metadata', () => {
      const result = controller.getLiveness();
      expect(result.status).toBe('ok');
      expect(typeof result.uptime).toBe('number');
      expect(result.version).toBe('1.0.0');
      expect(result.timestamp).toBeDefined();
    });

    it('returns live probe status', () => {
      const result = controller.getLive();
      expect(result.status).toBe('ok');
    });
  });

  describe('getReadiness', () => {
    it('returns 200 OK with healthy checks when database is reachable', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ 1: 1 }]);
      const res = createMockResponse();

      const result = await controller.getReadiness(res);

      expect(result.status).toBe('ok');
      expect(result.checks.database.status).toBe('up');
      expect(result.checks.memory.status).toBe('healthy');
      expect(res.status).not.toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    });

    it('sets status 503 SERVICE_UNAVAILABLE when database ping fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('Connection refused'));
      const res = createMockResponse();

      const result = await controller.getReadiness(res);

      expect(result.status).toBe('error');
      expect(result.checks.database.status).toBe('down');
      expect(result.checks.database.error).toBe('Connection refused');
      expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    });
  });
});
