import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ExperiencesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(placeSlug?: string) {
    return this.prisma.experience.findMany({
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBySlug(slug: string) {
    const experience = await this.prisma.experience.findUnique({
      where: { slug },
      include: {
        place: true,
      },
    });

    if (!experience) {
      throw new NotFoundException(`Experience with slug '${slug}' not found`);
    }

    return experience;
  }
}
