import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RefundsService } from './refunds.service';
import { RequestRefundDto } from './dto/request-refund.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Refunds & Cancellations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Get('quote/:bookingId')
  @ApiOperation({ summary: 'Get cancellation refund quote based on product policy and timing' })
  getRefundQuote(@Request() req: any, @Param('bookingId') bookingId: string) {
    const userId = req.user?.id || req.user?.userId;
    return this.refundsService.getRefundQuote(userId, bookingId);
  }

  @Post('process')
  @ApiOperation({ summary: 'Cancel booking and process eligible refund' })
  processRefund(@Request() req: any, @Body() dto: RequestRefundDto) {
    const userId = req.user?.id || req.user?.userId;
    return this.refundsService.processRefund(userId, dto);
  }
}
