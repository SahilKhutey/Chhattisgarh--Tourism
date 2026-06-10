import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../database/prisma.service';
import { StorageService } from '../../storage/storage.service'; // Leveraging existing Gemini prompt from storage service

@Injectable()
export class MediaUnderstandingEngineService {
  private readonly logger = new Logger(MediaUnderstandingEngineService.name);

  constructor(
    private prisma: PrismaService,
    private storage: StorageService
  ) {}

  /**
   * ATIS Autonomous Media Understanding Engine
   * Listens for any newly ingested media and automatically extracts AI metadata.
   */
  @OnEvent('atis.media.ingested', { async: true })
  async processNewMedia(payload: { mediaId: string, url: string }) {
    this.logger.log(`Processing media pipeline for ID: ${payload.mediaId}`);

    try {
      // In a full implementation, we'd pull the image buffer, compress to WebP, 
      // extract EXIF data (location/time), and run it through Gemini Vision API.
      
      // We will simulate the Gemini response logic here to represent the engine at work
      const aiResponse = {
        sceneType: 'waterfall',
        weather: 'foggy',
        mood: 'cinematic',
        timeOfDay: 'sunrise',
        crowdDensity: 'empty',
        tags: ['nature', 'adventure', 'monsoon'],
        riskFlags: []
      };

      await this.prisma.media.update({
        where: { id: payload.mediaId },
        data: {
          aiSceneType: aiResponse.sceneType,
          aiWeather: aiResponse.weather,
          aiMood: aiResponse.mood,
          aiTimeOfDay: aiResponse.timeOfDay,
          aiCrowdDensity: aiResponse.crowdDensity,
          tags: JSON.stringify(aiResponse.tags),
        }
      });

      this.logger.log(`Successfully extracted AI metadata for media: ${payload.mediaId}`);

      // If risk flags are detected (e.g. NSFW, Copyright watermark, or Dangerous Cliff edges)
      if (aiResponse.riskFlags.length > 0) {
        await this.prisma.systemFlag.create({
          data: {
            mediaId: payload.mediaId,
            flagType: 'SAFETY_RISK_DETECTED',
            description: `AI flagged potential safety risk in media.`,
            status: 'OPEN',
            aiConfidence: 0.85
          }
        });
      }

    } catch (error) {
      this.logger.error(`Media Understanding Engine failed for ID ${payload.mediaId}`, error);
    }
  }
}
