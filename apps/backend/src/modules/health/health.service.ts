import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  uptime: number;
  timestamp: string;
  version: string;
  environment: string;
}

export interface ReadinessCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  checks: {
    database: {
      status: 'up' | 'down';
      latencyMs?: number;
      error?: string;
    };
    memory: {
      status: 'healthy' | 'warning';
      heapUsedMB: number;
      heapTotalMB: number;
      rssMB: number;
    };
  };
}

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  checkLiveness(): HealthCheckResult {
    return {
      status: 'ok',
      uptime: Math.round(process.uptime() * 100) / 100,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  async checkDatabase(): Promise<{
    status: 'up' | 'down';
    latencyMs?: number;
    error?: string;
  }> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'up',
        latencyMs: Date.now() - start,
      };
    } catch (error: any) {
      return {
        status: 'down',
        error: error?.message || 'Database ping query failed',
      };
    }
  }

  checkMemory(): {
    status: 'healthy' | 'warning';
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  } {
    const mem = process.memoryUsage();
    const heapUsedMB = Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100;
    const heapTotalMB = Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100;
    const rssMB = Math.round((mem.rss / 1024 / 1024) * 100) / 100;

    const isHealthy = heapUsedMB < 1536;
    return {
      status: isHealthy ? 'healthy' : 'warning',
      heapUsedMB,
      heapTotalMB,
      rssMB,
    };
  }

  async checkReadiness(): Promise<ReadinessCheckResult> {
    const db = await this.checkDatabase();
    const memory = this.checkMemory();
    const isReady = db.status === 'up';

    return {
      status: isReady ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime() * 100) / 100,
      checks: {
        database: db,
        memory,
      },
    };
  }
}
