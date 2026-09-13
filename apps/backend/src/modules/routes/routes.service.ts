import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(zoneSlug?: string) {
    return this.prisma.route.findMany({
      where: zoneSlug ? { zone: { slug: zoneSlug } } : {},
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
  }

  async getBySlug(slug: string) {
    const route = await this.prisma.route.findUnique({
      where: { slug },
      include: {
        zone: true,
        places: {
          orderBy: { sequence: 'asc' },
          include: {
            place: true,
          },
        },
      },
    });

    if (!route) {
      throw new NotFoundException(`Route with slug '${slug}' not found`);
    }

    return route;
  }
}
