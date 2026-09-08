import {
  Body,
  Controller,
  Headers,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { WebhookEventPayload } from './payment-provider.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate payment intent for a booking' })
  createPaymentIntent(@Request() req: any, @Body() dto: CreatePaymentIntentDto) {
    const userId = req.user?.id || req.user?.userId;
    return this.paymentsService.createPaymentIntent(userId, dto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Process payment gateway webhook events' })
  handleWebhook(
    @Headers('x-webhook-signature') signature: string,
    @Body() payload: WebhookEventPayload,
  ) {
    return this.paymentsService.handleWebhook(payload, signature);
  }
}
