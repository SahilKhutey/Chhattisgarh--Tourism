import { HealthController } from '../health.controller';

describe('HealthController (Infrastructure)', () => {
  let controller: HealthController;
  let prisma: {
    $queryRaw: jest.Mock;
  };
  let redis: {
    ping: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };
    redis = {
      ping: jest.fn().mockResolvedValue('PONG'),
    };
    controller = new HealthController(prisma as any, redis as any);
  });

  it('reports healthy status when both database and redis are operational', async () => {
    const result = await controller.health();

    expect(result.status).toBe('ok');
    expect(result.services.database).toBe('up');
    expect(result.services.redis).toBe('up');
    expect(result.version).toBe('1.0.0');
    expect(typeof result.uptime).toBe('number');
  });

  it('reports degraded status when redis ping fails', async () => {
    redis.ping.mockRejectedValue(new Error('Redis timeout'));

    const result = await controller.health();

    expect(result.status).toBe('degraded');
    expect(result.services.database).toBe('up');
    expect(result.services.redis).toBe('down');
  });

  it('reports degraded status when database query fails', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('DB connection refused'));

    const result = await controller.health();

    expect(result.status).toBe('degraded');
    expect(result.services.database).toBe('down');
    expect(result.services.redis).toBe('up');
  });

  it('responds to liveness probe', () => {
    const res = controller.live();
    expect(res.status).toBe('ok');
  });

  it('responds to readiness probe with status 200 when ready', async () => {
    const mockRes = {
      status: jest.fn(),
    };
    const res = await controller.ready(mockRes as any);

    expect(res.status).toBe('ok');
    expect(res.checks.database.status).toBe('up');
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('responds with 503 on readiness probe when database is down', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('DB connection refused'));
    const mockRes = {
      status: jest.fn(),
    };
    const res = await controller.ready(mockRes as any);

    expect(res.status).toBe('error');
    expect(mockRes.status).toHaveBeenCalledWith(503);
  });
});
