import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { MarketplaceService } from './marketplace.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { QueryMarketplaceDto } from './dto/query-marketplace.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('products')
  @ApiOperation({ summary: 'Search marketplace tourism inventory' })
  searchProducts(@Query() query: QueryMarketplaceDto) {
    return this.marketplaceService.searchProducts(query);
  }

  @Get('products/slug/:slug')
  @ApiOperation({ summary: 'Get marketplace product details by slug' })
  getProductBySlug(@Param('slug') slug: string) {
    return this.marketplaceService.getProductBySlug(slug);
  }

  @Get('products/:id/availability')
  @ApiOperation({ summary: 'Get product availability calendar and remaining capacity' })
  getAvailability(@Param('id') id: string) {
    return this.marketplaceService.getAvailability(id);
  }

  @Post('products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Create a new marketplace tourism product' })
  createProduct(@Request() req: any, @Body() dto: CreateProductDto) {
    const actorId = req.user?.id || req.user?.userId;
    return this.marketplaceService.createProduct(dto, actorId);
  }

  @Patch('products/:id/activate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate a product (requires verified partner)' })
  activateProduct(@Request() req: any, @Param('id') id: string) {
    const actorId = req.user?.id || req.user?.userId;
    return this.marketplaceService.activateProduct(id, actorId);
  }

  @Patch('products/:id/deactivate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate a product from public search' })
  deactivateProduct(@Request() req: any, @Param('id') id: string) {
    const actorId = req.user?.id || req.user?.userId;
    return this.marketplaceService.deactivateProduct(id, actorId);
  }

  @Post('products/:id/availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add an inventory slot / date to a product' })
  addAvailability(
    @Param('id') id: string,
    @Body() dto: CreateAvailabilityDto,
  ) {
    return this.marketplaceService.addAvailability(id, dto);
  }
}
