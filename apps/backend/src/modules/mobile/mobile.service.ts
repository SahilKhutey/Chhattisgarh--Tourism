import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Injectable()
export class MobileService {
  constructor(private readonly prisma: PrismaService) {}

  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    const existing = await this.prisma.mobileDevice.findUnique({
      where: {
        deviceToken: dto.deviceToken,
      },
    });

    if (existing) {
      return this.prisma.mobileDevice.update({
        where: {
          deviceToken: dto.deviceToken,
        },
        data: {
          userId,
          platform: dto.platform,
          appVersion: dto.appVersion,
          deviceId: dto.deviceId,
          active: true,
          lastSeenAt: new Date(),
        },
        select: {
          id: true,
          platform: true,
          appVersion: true,
          active: true,
          lastSeenAt: true,
        },
      });
    }

    return this.prisma.mobileDevice.create({
      data: {
        userId,
        deviceToken: dto.deviceToken,
        platform: dto.platform,
        appVersion: dto.appVersion,
        deviceId: dto.deviceId,
      },
      select: {
        id: true,
        platform: true,
        appVersion: true,
        active: true,
        lastSeenAt: true,
      },
    });
  }

  async unregisterDevice(userId: string, deviceToken: string) {
    const device = await this.prisma.mobileDevice.findUnique({
      where: {
        deviceToken,
      },
    });

    if (!device || device.userId !== userId) {
      throw new NotFoundException('Mobile device not found.');
    }

    await this.prisma.mobileDevice.update({
      where: {
        deviceToken,
      },
      data: {
        active: false,
      },
    });

    return {
      success: true,
    };
  }

  async getActiveUserDevices(userId: string) {
    return this.prisma.mobileDevice.findMany({
      where: {
        userId,
        active: true,
      },
      select: {
        id: true,
        deviceToken: true,
        platform: true,
        appVersion: true,
        lastSeenAt: true,
      },
    });
  }
}
