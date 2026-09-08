import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { AlertSeverity } from './types/alert.type';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAlertDto) {
    return this.prisma.systemAlert.create({
      data: {
        type: dto.type,
        severity: dto.severity as any,
        title: dto.title,
        description: dto.description,
        districtId: dto.districtId,
        placeId: dto.placeId,
        metadata: (dto.metadata as any) ?? {},
      },
    });
  }

  async resolve(id: string) {
    const existing = await this.prisma.systemAlert.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Alert with id ${id} not found`);
    }

    return this.prisma.systemAlert.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });
  }

  async getActiveAlerts() {
    return this.prisma.systemAlert.findMany({
      where: { resolved: false },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });
  }

  async getAllAlerts() {
    return this.prisma.systemAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
