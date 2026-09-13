import { PublishingService } from './publishing.service';
import { PublishingValidatorService } from './publishing-validator.service';

describe('PublishingService', () => {
  let service: PublishingService;
  let validator: PublishingValidatorService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      place: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    validator = new PublishingValidatorService();
    service = new PublishingService(prisma, validator);
  });

  it('submits draft place for review', async () => {
    prisma.place.findUnique.mockResolvedValue({
      id: 'place-1',
      status: 'DRAFT',
    });

    prisma.place.update.mockResolvedValue({
      id: 'place-1',
      status: 'REVIEW',
      contentStatus: 'PENDING_REVIEW',
    });

    const result = await service.submit('place-1');
    expect(result.status).toBe('REVIEW');
    expect(prisma.place.update).toHaveBeenCalledWith({
      where: { id: 'place-1' },
      data: { status: 'REVIEW', contentStatus: 'PENDING_REVIEW' },
    });
  });

  it('rejects submitting a place that is not in draft status', async () => {
    prisma.place.findUnique.mockResolvedValue({
      id: 'place-1',
      status: 'REVIEW',
    });

    await expect(service.submit('place-1')).rejects.toThrow(
      'Only draft places can be submitted',
    );
  });

  it('publishes reviewed place after validation passes', async () => {
    prisma.place.findUnique.mockResolvedValue({
      id: 'place-1',
      name: 'Chitrakote Waterfalls',
      slug: 'chitrakote-waterfalls',
      latitude: 19.2024,
      longitude: 81.7067,
      description: 'The Niagara of India.',
      status: 'REVIEW',
      placeCategories: [{ categoryId: 'cat-1' }],
      category: { id: 'cat-1' },
    });

    prisma.place.update.mockResolvedValue({
      id: 'place-1',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      contentStatus: 'APPROVED',
      verified: true,
      publishedAt: new Date(),
    });

    const result = await service.publish('place-1');
    expect(result.status).toBe('PUBLISHED');
    expect(result.visibility).toBe('PUBLIC');
  });

  it('rejects publishing a place that has not been reviewed', async () => {
    prisma.place.findUnique.mockResolvedValue({
      id: 'place-1',
      status: 'DRAFT',
      placeCategories: [],
    });

    await expect(service.publish('place-1')).rejects.toThrow(
      'Only reviewed places can be published',
    );
  });

  it('archives place and makes it private', async () => {
    prisma.place.findUnique.mockResolvedValue({
      id: 'place-1',
      status: 'PUBLISHED',
    });

    prisma.place.update.mockResolvedValue({
      id: 'place-1',
      status: 'ARCHIVED',
      visibility: 'PRIVATE',
      contentStatus: 'ARCHIVED',
    });

    const result = await service.archive('place-1');
    expect(result.status).toBe('ARCHIVED');
    expect(result.visibility).toBe('PRIVATE');
  });
});
