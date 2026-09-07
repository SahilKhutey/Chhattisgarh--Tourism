import { Injectable, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PlaceContentService } from '../places/place-content.service';

@Injectable()
export class ModerationService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    private readonly placeContentService?: PlaceContentService,
  ) {}

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

  async approvePlace(id: string, reviewerId?: string) {
    const place = await this.prisma.place.findUnique({
      where: { id },
    });

    if (!place) {
      throw new NotFoundException(`Destination with ID ${id} does not exist inside pending queues.`);
    }

    if (reviewerId && this.placeContentService) {
      const auditResult = await this.placeContentService.verifyPlace(id, reviewerId, {
        decision: 'APPROVED',
        verificationLevel: 'OFFICIAL',
      });
      return {
        success: true,
        message: `Destination '${place.name}' has been verified and added to active discovery maps.`,
        placeId: auditResult.placeId,
        status: auditResult.status,
        verificationLevel: auditResult.verificationLevel,
      };
    }

    const approvedPlace = await this.prisma.place.update({
      where: { id },
      data: {
        verified: true,
        contentStatus: 'APPROVED',
        verificationLevel: 'OFFICIAL',
        verifiedAt: new Date(),
      },
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

  // ── Social Media Aggregation ────────────────────────────────────────────────

  async getPendingSocial() {
    return this.prisma.aggregatedContent.findMany({
      where: { status: 'PENDING' },
      include: {
        creator: {
          include: { user: { select: { fullName: true, email: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async verifySocial(id: string) {
    const content = await this.prisma.aggregatedContent.findUnique({
      where: { id },
      include: { creator: true }
    });
    if (!content) throw new NotFoundException('Pending social content not found.');

    // 1. Update status to APPROVED
    await this.prisma.aggregatedContent.update({
      where: { id },
      data: { status: 'APPROVED' }
    });

    // 2. Bridge to Public Feed
    const location = content.detectedLocation || 'Chhattisgarh';
    const category = content.detectedCategory || 'Explore';
    
    const newVideo = await this.prisma.creatorVideo.create({
      data: {
        creatorId: content.creatorId,
        title: `${location} - ${category}`, // Auto generated title
        videoUrl: content.mediaUrl,
        thumbnailUrl: content.thumbnailUrl,
        location: location,
        district: 'Bastar', // Default
        category: category,
        language: 'en'
      }
    });

    // 3. Link back
    await this.prisma.aggregatedContent.update({
      where: { id },
      data: { publishedVideoId: newVideo.id }
    });

    return { success: true, message: 'Content verified and published to live feed successfully.' };
  }

  async rejectSocial(id: string) {
    const content = await this.prisma.aggregatedContent.findUnique({ where: { id } });
    if (!content) throw new NotFoundException('Pending social content not found.');

    await this.prisma.aggregatedContent.update({
      where: { id },
      data: { status: 'REJECTED' }
    });

    return { success: true, message: 'Content rejected successfully.' };
  }

  async getSosAlerts(status?: string) {
    return this.prisma.emergencyAlert.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async deletePlace(id: string) {
    await this.prisma.place.delete({ where: { id } });
    return { success: true, message: 'Place deleted successfully.' };
  }

  async deleteCreator(id: string) {
    await this.prisma.creatorProfile.delete({ where: { id } });
    return { success: true, message: 'Creator deleted successfully.' };
  }
}

