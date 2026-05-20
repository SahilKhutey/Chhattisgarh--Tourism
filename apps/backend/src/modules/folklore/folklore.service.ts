import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FolkloreService {
  constructor(private readonly prisma: PrismaService) {}

  async createFolklore(data: any, userId: string) {
    const images = Array.isArray(data.images) ? JSON.stringify(data.images) : '[]';
    const videos = Array.isArray(data.videos) ? JSON.stringify(data.videos) : '[]';

    const result = await this.prisma.folklore.create({
      data: {
        title: data.title,
        monument: data.monument,
        location: data.location,
        description: data.description,
        images,
        videos,
        authorId: userId,
        verified: false,
      },
    });

    return {
      ...result,
      images: JSON.parse(result.images),
      videos: JSON.parse(result.videos),
    };
  }

  async getVerifiedFolklore() {
    const items = await this.prisma.folklore.findMany({
      where: { verified: true },
      include: {
        author: {
          select: { fullName: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return items.map(item => {
      try {
        return {
          ...item,
          images: JSON.parse(item.images || '[]'),
          videos: JSON.parse(item.videos || '[]'),
        };
      } catch (e) {
        return {
          ...item,
          images: [],
          videos: [],
        };
      }
    });
  }
}
