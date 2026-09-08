import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async health() {
    const database = await this.checkDatabase();
    const redis = await this.checkRedis();
    const healthy = database && redis;

    return {
      status: healthy ? 'ok' : 'degraded',
      services: {
        database: database ? 'up' : 'down',
        redis: redis ? 'up' : 'down',
      },
      uptime: Math.round(process.uptime() * 100) / 100,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  live() {
    return {
      status: 'ok',
      uptime: Math.round(process.uptime() * 100) / 100,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  @Get('ready')
  async ready(@Res({ passthrough: true }) res: Response) {
    const database = await this.checkDatabase();
    const redis = await this.checkRedis();
    const isReady = database;

    if (!isReady) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return {
      status: isReady ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime() * 100) / 100,
      checks: {
        database: {
          status: database ? 'up' : 'down',
        },
        redis: {
          status: redis ? 'up' : 'down',
        },
        memory: {
          status: 'healthy',
        },
      },
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    try {
      return (await this.redis.ping()) === 'PONG';
    } catch {
      return false;
    }
  }
}
