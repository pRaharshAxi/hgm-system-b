/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { NotificationsService } from './notifications.service';

@Injectable()
export class HarvestScheduler {
  private readonly logger = new Logger(HarvestScheduler.name);

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron('0 8 * * *')
  async handleHarvestAlerts() {
    this.logger.log('Running daily harvest alert check...');
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

      const result = await this.elasticsearchService.search({
        index: 'sysb_listings',
        body: {
          query: {
            bool: {
              must: [
                { range: { updatedAt: { gte: twentyFourHoursAgo } } },
                { range: { availableQuantity: { gt: 0 } } },
              ],
            },
          },
        },
      });

      const hits = result.hits.hits || [];
      let alertsSent = 0;

      for (const hit of hits) {
        const listing = hit._source as any;
        if (listing && listing.supplierId) {
          await this.notificationsService.create(
            listing.supplierId,
            'HARVEST_ALERT',
            'Daily Harvest Summary',
            `Your listing "${listing.title || 'Produce'}" has ${listing.availableQuantity} units available today.`,
            { listingId: hit._id },
          );
          alertsSent++;
        }
      }

      this.logger.log(`Daily harvest check completed. Sent ${alertsSent} harvest alerts.`);
    } catch (error: any) {
      this.logger.error(`Failed to process harvest alerts: ${error.message}`);
    }
  }
}