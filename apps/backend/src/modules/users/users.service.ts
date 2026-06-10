import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RegisterCreatorDto } from './dto/register-creator.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        creatorProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User profile with ID ${id} does not exist.`);
    }

    // Exclude password hash from response context
    const { password, ...result } = user;
    return result;
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User profile with ID ${id} does not exist.`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.fullName && { fullName: dto.fullName }),
        ...(dto.avatar && { avatar: dto.avatar }),
      },
      include: {
        creatorProfile: true,
      },
    });

    const { password, ...result } = updatedUser;
    return {
      success: true,
      message: 'Profile details updated successfully.',
      profile: result,
    };
  }

  async registerCreator(id: string, dto: RegisterCreatorDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        creatorProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User profile with ID ${id} does not exist.`);
    }

    if (user.creatorProfile) {
      throw new ConflictException('This traveler account has already registered as a creator profile.');
    }

    // Upgrades traveler account role and provisions creator profile staging context
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        role: 'CREATOR',
        creatorProfile: {
          create: {
            verified: false, // Held in queue for administrative checks
            bio: dto.bio,
            instagram: dto.instagram,
            youtube: dto.youtube,
          },
        },
      },
      include: {
        creatorProfile: true,
      },
    });

    const { password, ...result } = updatedUser;
    return {
      success: true,
      message: 'Creator registration application submitted successfully, pending administrative verification.',
      profile: result,
    };
  }

  async getCreatorFeed(page: number, limit: number) {
    const skip = (page - 1) * limit;
    
    // Fetch videos linked to verified creators, ordered by trending status and creation date
    const [total, videos] = await this.prisma.$transaction([
      this.prisma.creatorVideo.count({
        where: { creator: { verified: true } }
      }),
      this.prisma.creatorVideo.findMany({
        where: { creator: { verified: true } },
        include: {
          creator: {
            include: {
              user: { select: { fullName: true, avatar: true } }
            }
          }
        },
        orderBy: [
          { isTrending: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      })
    ]);

    return {
      videos,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getVerifiedCreators() {
    return this.prisma.creatorProfile.findMany({
      where: { verified: true },
      include: {
        user: { select: { fullName: true, avatar: true } },
        videos: { take: 5, orderBy: { views: 'desc' } }
      }
    });
  }

  async getCreatorProfile(id: string) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { id },
      include: {
        user: { select: { fullName: true, avatar: true } },
        videos: { orderBy: { createdAt: 'desc' } }
      }
    });
    
    if (!creator) throw new NotFoundException('Creator not found');
    return creator;
  }

  async createCreatorVideo(userId: string, dto: any) {
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { creatorProfile: true }
    });

    if (!user) {
      throw new NotFoundException(`User profile with ID ${userId} does not exist.`);
    }

    let creatorId = user.creatorProfile?.id;

    if (!creatorId) {
      // Auto-provision CreatorProfile if missing for native uploads
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          role: 'CREATOR',
          creatorProfile: {
            create: { verified: true, bio: 'Native Content Creator' }
          }
        },
        include: { creatorProfile: true }
      });
      creatorId = updatedUser.creatorProfile!.id;
    }

    return this.prisma.creatorVideo.create({
      data: {
        title: dto.title,
        location: dto.location,
        district: dto.district,
        category: dto.category,
        language: dto.language || 'English',
        thumbnailUrl: dto.thumbnailUrl,
        videoUrl: dto.videoUrl || null,
        creatorId: creatorId,
      }
    });
  }
}
