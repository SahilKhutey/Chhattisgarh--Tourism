import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async appointRole(userId: string, newRole: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    return { success: true, message: `User ${updated.fullName} role updated to ${updated.role}.` };
  }

  async getPendingCreators() {
    return this.prisma.creatorProfile.findMany({
      where: { verified: false },
      include: {
        user: { select: { fullName: true, email: true } },
      },
      orderBy: { user: { createdAt: 'desc' } },
    });
  }

  async verifyCreator(id: string) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { id }, include: { user: true } });
    if (!profile) throw new NotFoundException('Creator profile not found.');

    const updated = await this.prisma.creatorProfile.update({
      where: { id },
      data: { verified: true },
    });

    // Also update the user's role to CREATOR if they are currently just USER
    if (profile.user.role === 'USER') {
      await this.prisma.user.update({
        where: { id: profile.userId },
        data: { role: 'CREATOR' },
      });
    }

    return { success: true, message: `Creator profile for ${profile.user.fullName} verified successfully.` };
  }

  async getPendingPlaces() {
    return this.prisma.place.findMany({
      where: { verified: false },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async approvePlace(id: string) {
    const place = await this.prisma.place.findUnique({
      where: { id },
    });

    if (!place) {
      throw new NotFoundException(`Destination with ID ${id} does not exist inside pending queues.`);
    }

    const approvedPlace = await this.prisma.place.update({
      where: { id },
      data: { verified: true },
    });

    return {
      success: true,
      message: `Destination '${approvedPlace.name}' has been verified and added to active discovery maps.`,
      placeId: approvedPlace.id,
    };
  }

  async rejectPlace(id: string) {
    const place = await this.prisma.place.findUnique({
      where: { id },
    });

    if (!place) {
      throw new NotFoundException(`Destination with ID ${id} does not exist inside pending queues.`);
    }

    await this.prisma.place.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Destination submission rejected and deleted from backlog successfully.`,
    };
  }

  async getPendingFolklore() {
    const items = await this.prisma.folklore.findMany({
      where: { verified: false },
      include: {
        author: { select: { fullName: true, email: true } }
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

  async verifyFolklore(id: string) {
    const folklore = await this.prisma.folklore.findUnique({ where: { id } });
    if (!folklore) throw new NotFoundException('Folklore not found.');

    await this.prisma.folklore.update({
      where: { id },
      data: { verified: true },
    });

    return { success: true, message: 'Folklore verified successfully.' };
  }

  async rejectFolklore(id: string) {
    const folklore = await this.prisma.folklore.findUnique({ where: { id } });
    if (!folklore) throw new NotFoundException('Folklore not found.');

    await this.prisma.folklore.delete({
      where: { id },
    });

    return { success: true, message: 'Folklore rejected successfully.' };
  }

  async getSosAlerts(status?: string) {
    return this.prisma.emergencyAlert.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}

