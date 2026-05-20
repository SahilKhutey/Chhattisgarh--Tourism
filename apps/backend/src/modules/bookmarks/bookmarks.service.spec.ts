import { Test, TestingModule } from '@nestjs/testing';
import { BookmarksService } from './bookmarks.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('BookmarksService Unit Tests', () => {
  let service: BookmarksService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      place: {
        findUnique: jest.fn(),
      },
      bookmark: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarksService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<BookmarksService>(BookmarksService);
  });

  it('should be successfully initialized', () => {
    expect(service).toBeDefined();
  });

  describe('toggleBookmark operations tests', () => {
    it('should throw NotFoundException if targeted place ID is invalid or missing in PostgreSQL', async () => {
      const toggleDto = { placeId: 'invalid-uuid-999' };
      prismaMock.place.findUnique.mockResolvedValue(null);

      await expect(service.toggleBookmark('user-uuid-1', toggleDto)).rejects.toThrow(NotFoundException);
    });

    it('should create bookmark node and return bookmarked true if not already bookmarked', async () => {
      const toggleDto = { placeId: 'valid-place-uuid' };

      prismaMock.place.findUnique.mockResolvedValue({ id: 'valid-place-uuid', name: 'Chitrakote Falls' });
      prismaMock.bookmark.findUnique.mockResolvedValue(null); // Simulated not saved yet
      prismaMock.bookmark.create.mockResolvedValue({ id: 'new-bookmark-uuid' });

      const result = await service.toggleBookmark('user-uuid-1', toggleDto);

      expect(result.success).toBe(true);
      expect(result.bookmarked).toBe(true);
      expect(result.message).toContain('bookmarked successfully');
      expect(prismaMock.bookmark.create).toHaveBeenCalled();
    });

    it('should delete bookmark node and return bookmarked false if already bookmarked by user', async () => {
      const toggleDto = { placeId: 'valid-place-uuid' };

      prismaMock.place.findUnique.mockResolvedValue({ id: 'valid-place-uuid', name: 'Chitrakote Falls' });
      prismaMock.bookmark.findUnique.mockResolvedValue({ id: 'existing-bookmark-uuid' }); // Already saved
      prismaMock.bookmark.delete.mockResolvedValue({ id: 'existing-bookmark-uuid' });

      const result = await service.toggleBookmark('user-uuid-1', toggleDto);

      expect(result.success).toBe(true);
      expect(result.bookmarked).toBe(false);
      expect(result.message).toContain('removed successfully');
      expect(prismaMock.bookmark.delete).toHaveBeenCalled();
    });
  });

  describe('getBookmarks retrieval feeds tests', () => {
    it('should return chronological list of traveler bookmarked places', async () => {
      const mockBookmarksFeed = [
        {
          id: 'b-1',
          place: {
            id: 'p-1',
            name: 'Chitrakote Falls',
            slug: 'chitrakote-falls',
            description: 'Widest cascade.',
            district: 'Bastar',
            category: { name: 'Waterfalls' },
            latitude: 19.2006,
            longitude: 81.6961,
            heroImage: 'img_url',
            bestSeason: 'Monsoon',
            safetyInfo: 'Stay behind boundary lines.',
            rules: 'No plastics.',
          },
        },
      ];

      prismaMock.bookmark.findMany.mockResolvedValue(mockBookmarksFeed);

      const result = await service.getBookmarks('user-uuid-1');

      expect(result.length).toBe(1);
      expect(result[0].place.name).toBe('Chitrakote Falls');
      expect(result[0].place.category).toBe('Waterfalls');
      expect(prismaMock.bookmark.findMany).toHaveBeenCalled();
    });
  });
});
