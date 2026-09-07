import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FolkloreService {
  constructor(private readonly prisma: PrismaService) {}

  async createFolklore(data: any, userId: string) {
    const images = Array.isArray(data.images) ? JSON.stringify(data.images) : '[]';
    const videos = Array.isArray(data.videos) ? JSON.stringify(data.videos) : '[]';

    const result = await this.prisma.folklore.create({
      data: {
        title: data.title.trim(),
        monument: data.monument.trim(),
        location: data.location.trim(),
        description: data.description.trim(),
        images,
        videos,
        audioUrl: data.audioUrl || null,
        audioNarrator: data.audioNarrator || null,
        authorId: userId,
        verified: false,
        status: 'PENDING',
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
      where: {
        status: 'APPROVED',
        verified: true,
      },
      include: {
        author: {
          select: {
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return items.map((item) => ({
      ...item,
      images: this.safeParseArray(item.images),
      videos: this.safeParseArray(item.videos),
    }));
  }

  private safeParseArray(value: string | null | undefined): string[] {
    if (!value) {
      return [];
    }

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
