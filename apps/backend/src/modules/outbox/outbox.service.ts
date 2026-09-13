import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recordEvent(
    aggregateType: string,
    aggregateId: string,
    eventType: string,
    payload: Record<string, any>,
    tx?: any,
  ) {
    const client = tx || this.prisma;
    return client.outboxEvent.create({
      data: {
        aggregateType,
        aggregateId,
        eventType,
        payload,
        status: 'PENDING',
      },
    });
  }

  async getPendingEvents(limit = 50) {
    return this.prisma.outboxEvent.findMany({
      where: {
        status: 'PENDING',
        availableAt: { lte: new Date() },
      },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });
  }

  async markProcessed(eventId: string, tx?: any) {
    const client = tx || this.prisma;
    return client.outboxEvent.update({
      where: { id: eventId },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
      },
    });
  }

  async markFailed(eventId: string, error?: string, tx?: any) {
    const client = tx || this.prisma;
    return client.outboxEvent.update({
      where: { id: eventId },
      data: {
        attempts: { increment: 1 },
        status: 'DEAD_LETTER',
      },
    });
  }
}
