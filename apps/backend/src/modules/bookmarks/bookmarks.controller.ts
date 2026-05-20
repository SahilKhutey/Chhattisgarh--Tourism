import { Controller, Post, Get, Body, Headers, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBody } from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import { ToggleBookmarkDto } from './dto/toggle-bookmark.dto';

@ApiTags('Bookmarks Operations')
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post('toggle')
  @ApiOperation({ summary: 'Toggle destination bookmark for visitor profile' })
  @ApiHeader({ name: 'x-user-id', required: true, description: 'Simulated authorized User ID' })
  @ApiBody({ type: ToggleBookmarkDto })
  async toggleBookmark(
    @Headers('x-user-id') userId: string,
    @Body(new ValidationPipe()) dto: ToggleBookmarkDto,
  ) {
    if (!userId) {
      throw new UnauthorizedException('Authorization header x-user-id is required to bookmark destinations.');
    }
    return this.bookmarksService.toggleBookmark(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve list of all bookmarked places' })
  @ApiHeader({ name: 'x-user-id', required: true, description: 'Simulated authorized User ID' })
  async getBookmarks(@Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authorization header x-user-id is required to fetch bookmarks.');
    }
    return this.bookmarksService.getBookmarks(userId);
  }
}
