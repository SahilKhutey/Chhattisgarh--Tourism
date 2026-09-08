import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private static isConnecting = false;
  private static isFailed = false;

  async onModuleInit() {
    if (PrismaService.isFailed) return;
    if (PrismaService.isConnecting) return;
    PrismaService.isConnecting = true;
    try {
      await this.$connect();
      console.log('Database connected successfully via Prisma Client.');
    } catch (error: any) {
      PrismaService.isFailed = true;
      console.warn('Database connection failed. Running NestJS server in sandbox mode without active database connectivity:', error?.message);
    } finally {
      PrismaService.isConnecting = false;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (error) {
      console.warn('Prisma disconnection failed:', error.message);
    }
  }
}
