/* eslint-disable prettier/prettier, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class ListingIndexService implements OnModuleInit {
  private readonly logger = new Logger(ListingIndexService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async onModuleInit() {
    await this.createIndexIfNotExists();
  }

  async createIndexIfNotExists() {
    const indexName = 'hgm_listings';
    try {
      const exists = await this.elasticsearchService.indices.exists({ index: indexName });
      if (!exists) {
        await this.elasticsearchService.indices.create({
          index: indexName,
          mappings: {
            properties: {
              title: { type: 'text', analyzer: 'standard' },
              description: { type: 'text', analyzer: 'standard' },
              category: { type: 'keyword' },
              price: { type: 'float' },
              quantity: { type: 'integer' },
              unit: { type: 'keyword' },
              supplierId: { type: 'keyword' },
              supplierName: {
                type: 'text',
                fields: { keyword: { type: 'keyword' } },
              },
              supplierRating: { type: 'float' },
              latitude: { type: 'float' },
              longitude: { type: 'float' },
              location: { type: 'geo_point' },
              images: { type: 'keyword', index: false },
              isActive: { type: 'boolean' },
              createdAt: { type: 'date' },
            },
          } as any,
        });
        this.logger.log(`Created Elasticsearch index '${indexName}' successfully.`);
      } else {
        this.logger.log(`Elasticsearch index '${indexName}' already exists.`);
      }
    } catch (error) {
      this.logger.error(`Failed to initialize index '${indexName}':`, error);
    }
  }

  async indexListing(payload: any) {
    return this.elasticsearchService.index({
      index: 'hgm_listings',
      id: payload.id,
      document: {
        ...payload,
        location:
          payload.latitude && payload.longitude
            ? { lat: payload.latitude, lon: payload.longitude }
            : undefined,
      },
    });
  }

  async updateListing(id: string, partial: any) {
    return this.elasticsearchService.update({
      index: 'hgm_listings',
      id,
      doc: partial,
    });
  }

  async deleteListing(id: string) {
    return this.elasticsearchService.delete({
      index: 'hgm_listings',
      id,
    });
  }

  async getIndexStats() {
    return this.elasticsearchService.indices.stats({ index: 'hgm_listings' });
  }
}