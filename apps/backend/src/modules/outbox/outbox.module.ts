import { Global, Module } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { PrismaService } from '../../database/prisma.service';

@Global()
@Module({
  providers: [OutboxService, PrismaService],
  exports: [OutboxService],
})
export class OutboxModule {}
