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

  formatPushPayload(notification: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }): {
    notification: { title: string; body: string };
    data: Record<string, unknown>;
    android: { priority: string; notification: { channelId: string; sound: string } };
    apns: { payload: { aps: { alert: { title: string; body: string }; sound: string; badge: number } } };
  } {
    return {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...(notification.data ?? {}),
        timestamp: new Date().toISOString(),
      },

      android: {
        priority: 'high',
        notification: {
          channelId: 'cg_tourism_alerts',
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title,
              body: notification.body,
            },
            sound: 'default',
            badge: 1,
          },
        },
      },
    };
  }

  async dispatchNotificationToUser(
    userId: string,
    notification: { title: string; body: string; data?: Record<string, unknown> },
  ) {
    const devices = await this.getActiveUserDevices(userId);
    const payload = this.formatPushPayload(notification);

    return {
      dispatchedCount: devices.length,
      deviceTokens: devices.map((d) => d.deviceToken),
      payload,
    };
  }
}

