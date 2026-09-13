import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TourismServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(placeSlug?: string) {
    return this.prisma.tourismService.findMany({
      where: {
        isActive: true,
        ...(placeSlug ? { place: { slug: placeSlug } } : {}),
      },
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
  }

  async getById(id: string) {
    const service = await this.prisma.tourismService.findUnique({
      where: { id },
      include: {
        place: true,
      },
    });

    if (!service) {
      throw new NotFoundException(`Tourism service with ID '${id}' not found`);
    }

    return service;
  }
}
