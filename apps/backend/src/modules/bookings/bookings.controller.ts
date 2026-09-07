import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a tourism booking' })
  createBooking(@Request() req: any, @Body() dto: CreateBookingDto) {
    const userId = req.user?.id || req.user?.userId;
    return this.bookingsService.createBooking(userId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get authenticated user bookings' })
  getMyBookings(@Request() req: any) {
    const userId = req.user?.id || req.user?.userId;
    return this.bookingsService.getMyBookings(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one authenticated user booking' })
  getBooking(@Request() req: any, @Param('id') bookingId: string) {
    const userId = req.user?.id || req.user?.userId;
    return this.bookingsService.getBooking(userId, bookingId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a confirmed booking' })
  cancelBooking(@Request() req: any, @Param('id') bookingId: string) {
    const userId = req.user?.id || req.user?.userId;
    return this.bookingsService.cancelBooking(userId, bookingId);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete a confirmed booking' })
  completeBooking(@Param('id') bookingId: string) {
    return this.bookingsService.completeBooking(bookingId);
  }
}
