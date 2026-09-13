import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PublishingValidatorService } from './publishing-validator.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

@Injectable()
export class PublishingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validator: PublishingValidatorService,
    private readonly redis?: RedisService,
  ) {}

  async submit(placeId: string) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    if (place.status !== 'DRAFT') {
      throw new BadRequestException('Only draft places can be submitted');
    }

    return this.prisma.place.update({
      where: { id: placeId },
      data: {
        status: 'REVIEW',
        contentStatus: 'PENDING_REVIEW',
      },
    });
  }

  async publish(placeId: string) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
      include: {
        placeCategories: true,
        category: true,
      },
    });

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    if (place.status !== 'REVIEW') {
      throw new BadRequestException('Only reviewed places can be published');
    }

    const categories =
      place.placeCategories.length > 0
        ? place.placeCategories
        : place.categoryId
        ? [place.category]
        : [];

    this.validator.validatePlace({
      name: place.name,
      slug: place.slug,
      latitude: place.latitude,
      longitude: place.longitude,
      categories,
      description: place.description,
    });

    const updated = await this.prisma.place.update({
      where: { id: placeId },
      data: {
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        contentStatus: 'APPROVED',
        verified: true,
        publishedAt: new Date(),
      },
    });

    await this.redis?.deletePattern('discovery:*');

    return updated;
  }

  async archive(placeId: string) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    const updated = await this.prisma.place.update({
      where: { id: placeId },
      data: {
        status: 'ARCHIVED',
        visibility: 'PRIVATE',
        contentStatus: 'ARCHIVED',
      },
    });

    await this.redis?.deletePattern('discovery:*');

    return updated;
  }
}
