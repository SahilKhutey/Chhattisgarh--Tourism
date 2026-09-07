import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { VerifyPlaceDto } from './dto/verify-place.dto';

@Injectable()
export class PlaceContentService {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingPlaces() {
    return this.prisma.place.findMany({
      where: {
        contentStatus: 'PENDING_REVIEW',
      },
      include: {
        category: true,
        media: true,
        contentOwner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getPlaceForReview(id: string) {
    const place = await this.prisma.place.findUnique({
      where: { id },
      include: {
        category: true,
        media: true,
        contentOwner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        verificationHistory: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            reviewer: {
              select: {
                id: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!place) {
      throw new NotFoundException('Place not found.');
    }

    return place;
  }

  async verifyPlace(
    placeId: string,
    reviewerId: string,
    dto: VerifyPlaceDto,
  ) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException('Place not found.');
    }

    if (place.contentStatus === 'ARCHIVED') {
      throw new BadRequestException('Archived places cannot be verified.');
    }

    const approved = dto.decision === 'APPROVED';

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedPlace = await tx.place.update({
        where: { id: placeId },
        data: {
          verified: approved,
          contentStatus: approved ? 'APPROVED' : 'REJECTED',
          verificationLevel: approved ? dto.verificationLevel : 'UNVERIFIED',
          verificationNotes: dto.notes || null,
          verifiedAt: approved ? new Date() : null,
        },
      });

      await tx.placeVerification.create({
        data: {
          placeId,
          reviewerId,
          fromLevel: place.verificationLevel,
          toLevel: approved ? dto.verificationLevel : 'UNVERIFIED',
          decision: dto.decision,
          notes: dto.notes || null,
        },
      });

      return updatedPlace;
    });

    return {
      success: true,
      placeId: updated.id,
      status: updated.contentStatus,
      verificationLevel: updated.verificationLevel,
    };
  }

  async revokeVerification(
    placeId: string,
    reviewerId: string,
    notes?: string,
  ) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException('Place not found.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.place.update({
        where: { id: placeId },
        data: {
          verified: false,
          contentStatus: 'PENDING_REVIEW',
          verificationLevel: 'UNVERIFIED',
          verificationNotes: notes || null,
          verifiedAt: null,
        },
      });

      await tx.placeVerification.create({
        data: {
          placeId,
          reviewerId,
          fromLevel: place.verificationLevel,
          toLevel: 'UNVERIFIED',
          decision: 'REVOKED',
          notes: notes || null,
        },
      });

      return result;
    });

    return {
      success: true,
      placeId: updated.id,
      status: updated.contentStatus,
    };
  }
}
