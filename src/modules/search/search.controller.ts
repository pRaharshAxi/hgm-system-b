/* eslint-disable prettier/prettier */
import { Controller, Get, Query, Res } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { Response } from 'express';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query() dto: SearchQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { isCached, data } = await this.searchService.search(dto);
    res.setHeader('X-Cache', isCached ? 'HIT' : 'MISS');
    return data;
  }
}
