import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FolkloreService {
  constructor(private readonly prisma: PrismaService) {}

  async createFolklore(data: any, userId: string) {
    return this.prisma.folklore.create({
      data: {
        title: data.title,
        monument: data.monument,
        location: data.location,
        description: data.description,
        images: data.images || [],
        videos: data.videos || [],
        authorId: userId,
        verified: false,
      },
    });
  }

  async getVerifiedFolklore() {
    return this.prisma.folklore.findMany({
      where: { verified: true },
      include: {
        author: {
          select: { fullName: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
