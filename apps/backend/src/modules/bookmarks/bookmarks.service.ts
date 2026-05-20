import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ToggleBookmarkDto } from './dto/toggle-bookmark.dto';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleBookmark(userId: string, dto: ToggleBookmarkDto) {
    // 1. Verify that the place exists in the system
    const place = await this.prisma.place.findUnique({
      where: { id: dto.placeId },
    });

    if (!place) {
      throw new NotFoundException(`Destination with ID ${dto.placeId} does not exist.`);
    }

    // 2. Check if the bookmark is already present
    const existingBookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_placeId: {
          userId,
          placeId: dto.placeId,
        },
      },
    });

    if (existingBookmark) {
      // Un-bookmark destination
      await this.prisma.bookmark.delete({
        where: {
          userId_placeId: {
            userId,
            placeId: dto.placeId,
          },
        },
      });
      return { success: true, bookmarked: false, message: 'Bookmark removed successfully.' };
    } else {
      // Bookmark destination
      await this.prisma.bookmark.create({
        data: {
          userId,
          placeId: dto.placeId,
        },
      });
      return { success: true, bookmarked: true, message: 'Destination bookmarked successfully.' };
    }
  }

  async getBookmarks(userId: string) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
      include: {
        place: {
          include: {
            category: true,
          },
        },
      },
    });

    return bookmarks.map(b => ({
      bookmarkId: b.id,
      place: {
        id: b.place.id,
        name: b.place.name,
        slug: b.place.slug,
        description: b.place.description,
        district: b.place.district,
        category: b.place.category.name,
        latitude: b.place.latitude,
        longitude: b.place.longitude,
        heroImage: b.place.heroImage,
        bestSeason: b.place.bestSeason,
        safetyInfo: b.place.safetyInfo,
        rules: b.place.rules,
      },
    }));
  }
}
