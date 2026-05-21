import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  createBooking(@Request() req, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.createBooking(req.user.userId, createBookingDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get all bookings for the authenticated user' })
  getMyBookings(@Request() req) {
    return this.bookingsService.getMyBookings(req.user.userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an existing booking' })
  cancelBooking(@Request() req, @Param('id') bookingId: string) {
    return this.bookingsService.cancelBooking(req.user.userId, bookingId);
  }
}
