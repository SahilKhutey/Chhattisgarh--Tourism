import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class VerificationEngineService {
  private readonly logger = new Logger(VerificationEngineService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * ATIS Autonomous Content Trust Engine
   * Listens for place discoveries or updates and calculates their trust score.
   */
  @OnEvent('atis.place.discovered', { async: true })
  async verifyNewDestination(place: any) {
    this.logger.log(`Evaluating Verification & Trust Score for Place ID: ${place.id}`);

    // In a real implementation, we would cross-reference:
    // 1. Govt Open Data Portals
    // 2. Verified Creator GPS tags
    // 3. OpenStreetMap
    
    // Auto-calculate trust tier
    let assignedLevel = 'UNVERIFIED';
    
    // Simulate simple heuristic logic:
    if (place.description && place.description.includes('Govt Portal')) {
      assignedLevel = 'OFFICIAL';
    } else if (place.heroImage && place.heroImage.includes('AI+Discovered')) {
      assignedLevel = 'AI_ESTIMATED';
    } else {
      assignedLevel = 'COMMUNITY';
    }

    await this.prisma.place.update({
      where: { id: place.id },
      data: { verificationLevel: assignedLevel }
    });

    this.logger.log(`Assigned Trust Level [${assignedLevel}] to Place ID: ${place.id}`);
  }

  /**
   * Called when a creator uploads media, dynamically adjusts the place's media quality score.
   */
  async reevaluateMediaScore(placeId: string) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
      include: { media: true, scores: true }
    });

    if (!place) return;

    // The more verified creator media, the higher the media quality score
    const highQualityMediaCount = place.media.filter(m => m.license === 'CREATOR_LICENSED').length;
    let newScore = 50 + (highQualityMediaCount * 5);
    if (newScore > 100) newScore = 100;

    await this.prisma.destinationScore.upsert({
      where: { placeId: place.id },
      update: { mediaQuality: newScore },
      create: { placeId: place.id, mediaQuality: newScore }
    });
    
    this.logger.log(`Updated Media Quality Score for [${place.name}] to ${newScore}`);
  }
}
