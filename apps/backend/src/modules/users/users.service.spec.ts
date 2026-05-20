import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersService Unit Tests', () => {
  let service: UsersService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be successfully initialized', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile operations tests', () => {
    it('should throw NotFoundException if targeted user ID does not exist in PostgreSQL', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(service.getProfile('invalid-user-uuid')).rejects.toThrow(NotFoundException);
    });

    it('should return profile information excluding password hash', async () => {
      const mockDbUser = {
        id: 'user-uuid-1',
        fullName: 'Devendra Mandavi',
        email: 'traveler@cg.gov.in',
        password: 'secure_password_hash',
        role: 'USER',
        creatorProfile: null,
      };

      prismaMock.user.findUnique.mockResolvedValue(mockDbUser);

      const result = await service.getProfile('user-uuid-1');

      expect(result.id).toBe('user-uuid-1');
      expect((result as any).password).toBeUndefined(); // Filtered password
      expect(result.fullName).toBe('Devendra Mandavi');
    });
  });

  describe('updateProfile operations tests', () => {
    it('should throw NotFoundException if user ID is missing in database', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(service.updateProfile('invalid-user-uuid', { fullName: 'Aarav' })).rejects.toThrow(NotFoundException);
    });

    it('should update traveler properties and return updated profile payload', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-uuid-1' });

      const mockUpdatedUser = {
        id: 'user-uuid-1',
        fullName: 'Aarav Mandavi',
        email: 'traveler@cg.gov.in',
        role: 'USER',
        avatar: 'avatar_url',
      };
      prismaMock.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.updateProfile('user-uuid-1', {
        fullName: 'Aarav Mandavi',
        avatar: 'avatar_url',
      });

      expect(result.success).toBe(true);
      expect(result.profile.fullName).toBe('Aarav Mandavi');
      expect(result.profile.avatar).toBe('avatar_url');
    });
  });

  describe('registerCreator operations tests', () => {
    it('should throw ConflictException if traveler is already registered as a creator profile', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        creatorProfile: { id: 'existing-creator-uuid' },
      });

      const creatorDto = {
        bio: 'Tribal heritage guide.',
      };

      await expect(service.registerCreator('user-uuid-1', creatorDto)).rejects.toThrow(ConflictException);
    });

    it('should upgrade role and create creator profile staging logs successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        creatorProfile: null, // Eligible to register
      });

      const mockUpdatedUser = {
        id: 'user-uuid-1',
        role: 'CREATOR',
        creatorProfile: {
          bio: 'Tribal heritage guide.',
          verified: false, // Default pending moderation review
        },
      };
      prismaMock.user.update.mockResolvedValue(mockUpdatedUser);

      const creatorDto = {
        bio: 'Tribal heritage guide.',
      };

      const result = await service.registerCreator('user-uuid-1', creatorDto);

      expect(result.success).toBe(true);
      expect(result.profile.role).toBe('CREATOR');
      expect(result.profile.creatorProfile.verified).toBe(false);
      expect(prismaMock.user.update).toHaveBeenCalled();
    });
  });
});
