import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MockPaymentProvider } from './mock-payment.provider';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, MockPaymentProvider, PrismaService],
  exports: [PaymentsService, MockPaymentProvider],
})
export class PaymentsModule {}
