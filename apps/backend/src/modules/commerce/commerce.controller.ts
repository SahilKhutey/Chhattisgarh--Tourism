import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommerceService } from './commerce.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Commerce & Settlements')
@Controller('commerce')
export class CommerceController {
  constructor(private readonly commerceService: CommerceService) {}

  @Get('settlements/partner/:partnerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get partner settlement ledger and payable balance' })
  getPartnerSettlement(@Param('partnerId') partnerId: string) {
    return this.commerceService.getPartnerSettlement(partnerId);
  }

  @Get('commissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List platform partner commissions (Admin only)' })
  listCommissions(@Query('partnerId') partnerId?: string) {
    return this.commerceService.listCommissions({ partnerId });
  }
}
