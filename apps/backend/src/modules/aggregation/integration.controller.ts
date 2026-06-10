import { Controller, Get, Post, Patch, Body, Logger, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationController {
  private readonly logger = new Logger(IntegrationController.name);

  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateCreatorProfile(userId: string) {
    let creator = await this.prisma.creatorProfile.findUnique({
      where: { userId }
    });

    if (!creator) {
      creator = await this.prisma.creatorProfile.create({
        data: {
          userId,
          verified: true // auto-verify for seamless onboarding
        }
      });
      // Seamlessly upgrade user role to CREATOR
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: 'CREATOR' }
      });
    }

    return creator;
  }

  @Get('me')
  async getIntegrations(@Request() req) {
    const userId = req.user.id || req.user.sub;
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { userId },
      include: { integrations: true }
    });

    if (!creator) {
      return { integrations: [] };
    }

    return { integrations: creator.integrations };
  }

  @Post('me/connect')
  async connectPlatform(
    @Request() req,
    @Body() body: { platform: string; handle?: string }
  ) {
    const userId = req.user.id || req.user.sub;
    this.logger.log(`Connecting ${body.platform} for user ${userId}`);

    const creator = await this.getOrCreateCreatorProfile(userId);
    const platformUserId = body.handle || `mock_${body.platform}_123`;

    const integration = await this.prisma.socialIntegration.upsert({
      where: {
        creatorId_platform: {
          creatorId: creator.id,
          platform: body.platform
        }
      },
      update: { syncEnabled: true, platformUserId },
      create: {
        creatorId: creator.id,
        platform: body.platform,
        syncEnabled: true,
        platformUserId,
        accessToken: `mock_token_${Date.now()}`
      }
    });

    return { success: true, integration };
  }

  @Post('me/disconnect')
  async disconnectPlatform(
    @Request() req,
    @Body() body: { platform: string }
  ) {
    const userId = req.user.id || req.user.sub;
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    
    if (creator) {
      await this.prisma.socialIntegration.deleteMany({
        where: {
          creatorId: creator.id,
          platform: body.platform
        }
      });
    }
    return { success: true };
  }

  @Patch('me/preferences')
  async updatePreferences(
    @Request() req,
    @Body() body: { syncTravelOnly?: boolean; autoApprove?: boolean; autoGenerateTags?: boolean }
  ) {
    const userId = req.user.id || req.user.sub;
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });

    if (creator) {
      await this.prisma.socialIntegration.updateMany({
        where: { creatorId: creator.id },
        data: { ...body }
      });
    }
    return { success: true };
  }
}
