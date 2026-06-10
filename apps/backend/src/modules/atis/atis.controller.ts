import { Controller, Get, Post, Param, Body, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Controller('atis')
export class AtisController {
  private readonly logger = new Logger(AtisController.name);

  constructor(private prisma: PrismaService) {}

  @Get('stats')
  async getStats() {
    const totalNodes = await this.prisma.place.count();
    const verifiedNodes = await this.prisma.place.count({ where: { verified: true } });
    const activeFlags = await this.prisma.systemFlag.count({ where: { status: 'OPEN' } });
    const pendingDiscoveries = await this.prisma.place.count({ where: { verificationLevel: 'AI_ESTIMATED' } });

    return {
      totalNodes,
      verifiedNodes,
      activeFlags,
      pendingDiscoveries,
      systemHealth: activeFlags > 10 ? 'WARNING' : 'OPTIMAL'
    };
  }

  @Get('flags')
  async getActiveFlags() {
    return this.prisma.systemFlag.findMany({
      where: { status: 'OPEN' },
      include: {
        place: { select: { id: true, name: true } },
        media: { select: { id: true, url: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Get('pending-places')
  async getPendingPlaces() {
    return this.prisma.place.findMany({
      where: { verificationLevel: 'AI_ESTIMATED' },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Post('approve-place/:id')
  async approvePlace(@Param('id') id: string, @Body() body: { level: string }) {
    this.logger.log(`Admin approved place ${id} with level ${body.level}`);
    
    return this.prisma.place.update({
      where: { slug: id },
      data: {
        verificationLevel: body.level,
        verified: body.level === 'OFFICIAL' || body.level === 'COMMUNITY' || body.level === 'CREATOR_VERIFIED'
      }
    });
  }
}
