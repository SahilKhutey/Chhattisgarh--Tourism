import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(
    action: string,
    resourceType: string,
    resourceId: string,
    actorId?: string,
    metadata?: Record<string, any>,
    ip?: string,
    userAgent?: string,
    tx?: any,
  ) {
    const client = tx || this.prisma;
    return client.auditLog.create({
      data: {
        action,
        resourceType,
        resourceId,
        actorId,
        metadata: metadata ? (metadata as any) : undefined,
        ip,
        userAgent,
      },
    });
  }

  async getResourceLogs(resourceType: string, resourceId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        resourceType,
        resourceId,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
