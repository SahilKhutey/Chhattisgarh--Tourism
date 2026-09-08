import { AlertsService } from './alerts.service';
import { AlertSeverity } from './types/alert.type';

describe('AlertService', () => {
  let service: AlertsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      systemAlert: {
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: 'alert-1',
            ...data,
            resolved: false,
            createdAt: new Date(),
          }),
        ),
        findUnique: jest.fn().mockResolvedValue({
          id: 'alert-1',
          type: 'CONTENT_STALE',
          severity: AlertSeverity.WARNING,
          resolved: false,
        }),
        update: jest.fn().mockImplementation(({ where, data }) =>
          Promise.resolve({
            id: where.id,
            resolved: data.resolved,
            resolvedAt: data.resolvedAt,
          }),
        ),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    service = new AlertsService(prisma);
  });

  it('creates a warning alert', async () => {
    const alert = await service.create({
      type: 'CONTENT_STALE',
      severity: AlertSeverity.WARNING,
      title: 'Content is stale',
      description: 'Destination requires review',
    });

    expect(alert.severity).toBe(AlertSeverity.WARNING);
    expect(prisma.systemAlert.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'CONTENT_STALE',
          severity: AlertSeverity.WARNING,
          title: 'Content is stale',
          description: 'Destination requires review',
        }),
      }),
    );
  });

  it('resolves an alert', async () => {
    const alert = await service.resolve('alert-1');

    expect(alert.resolved).toBe(true);
    expect(alert.resolvedAt).toBeDefined();
    expect(prisma.systemAlert.update).toHaveBeenCalledWith({
      where: { id: 'alert-1' },
      data: {
        resolved: true,
        resolvedAt: expect.any(Date),
      },
    });
  });
});
