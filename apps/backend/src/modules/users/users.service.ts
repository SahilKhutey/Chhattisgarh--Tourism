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
}
