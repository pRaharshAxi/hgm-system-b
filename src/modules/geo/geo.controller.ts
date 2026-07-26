/* eslint-disable prettier/prettier */
import { Controller, Get, Query, Res, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Response } from 'express';
import { GeoService } from './geo.service';
import { NearbyQueryDto } from './dto/nearby-query.dto';

@Controller('geo')
export class GeoController {
  constructor(
    private readonly geoService: GeoService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Get('nearby')
  async findNearby(
    @Query() query: NearbyQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { lat, lng, radius = 10, category } = query;

    const normalizedCategory = category ? category.toUpperCase() : '';
    const cacheKey = `geo:${lat}:${lng}:${radius}:${normalizedCategory}`;

    // 1. Check Redis Cache
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return cachedData;
    }

    // 2. Fetch from GeoService / MongoDB
    const data = await this.geoService.findNearby(lat, lng, radius, normalizedCategory);

    // 3. Store in Cache (300 seconds TTL = 300,000 ms)
    await this.cacheManager.set(cacheKey, data, 300000);
    res.setHeader('X-Cache', 'MISS');

    return data;
  }
}