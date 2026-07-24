/* eslint-disable prettier/prettier, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Injectable, Inject } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SearchQueryDto, SortOption } from './dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async search(dto: SearchQueryDto) {
    const { q, category, priceMin, priceMax, page = 1, limit = 20, sort = SortOption.RELEVANCE } = dto;
    const cacheKey = `search:${q || ''}:${category || ''}:${priceMin ?? ''}:${priceMax ?? ''}:${page}:${sort}`;

    // 1. Check Redis Cache
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return {
        isCached: true,
        data: cachedData,
      };
    }

    // 2. Build Query Filters
    const must: any[] = [];
    const filter: any[] = [{ term: { isActive: true } }];

    if (q) {
      must.push({
        multi_match: {
          query: q,
          fields: ['title^2', 'description'],
          fuzziness: 'AUTO',
        },
      });
    }

    if (category) {
      filter.push({ term: { category } });
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      const range: any = {};
      if (priceMin !== undefined) range.gte = priceMin;
      if (priceMax !== undefined) range.lte = priceMax;
      filter.push({ range: { price: range } });
    }

    // 3. Build Sorting
    let sortOptions: any[] = ['_score'];
    if (sort === SortOption.PRICE_ASC) sortOptions = [{ price: 'asc' }];
    if (sort === SortOption.PRICE_DESC) sortOptions = [{ price: 'desc' }];
    if (sort === SortOption.NEWEST) sortOptions = [{ createdAt: 'desc' }];

    const from = (page - 1) * limit;

    // 4. Query Elasticsearch
    const result = await this.elasticsearchService.search({
      index: 'hgm_listings',
      from,
      size: limit,
      sort: sortOptions,
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }],
          filter,
        },
      },
      aggs: {
        categories: { terms: { field: 'category' } },
        price_stats: { stats: { field: 'price' } },
      },
    });

    const total = typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0;
    const results = result.hits.hits.map((hit) => ({
      id: hit._id,
      ...(hit._source as object),
    }));

    const responsePayload = {
      results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      aggregations: result.aggregations,
    };

    // 5. Cache Payload in Redis (120s TTL)
    await this.cacheManager.set(cacheKey, responsePayload, 120000);

    return {
      isCached: false,
      data: responsePayload,
    };
  }
}