/* eslint-disable prettier/prettier, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import { ListingIndexService } from '../modules/search/listing-index.service';
import { GeoService } from '../modules/geo/geo.service';

@Injectable()
export class ListingConsumerService implements OnModuleInit {
  private readonly logger = new Logger(ListingConsumerService.name);
  private connection: any;
  private channel: amqp.Channel;

  constructor(
    private readonly listingIndexService: ListingIndexService,
    private readonly geoService: GeoService,
  ) {}

  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry() {
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    try {
      this.connection = await amqp.connect(rabbitUrl);

      this.connection.on('error', (err) => {
        this.logger.error(`RabbitMQ connection error: ${err.message}`);
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed. Reconnecting in 5s...');
        setTimeout(() => this.connectWithRetry(), 5000);
      });

      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange('hgm', 'topic', { durable: true });
      await this.channel.assertQueue('sysb.listing.events', { durable: true });
      await this.channel.bindQueue('sysb.listing.events', 'hgm', 'listing.#');

      this.logger.log('Connected to RabbitMQ - Consuming sysb.listing.events');

      await this.channel.consume(
        'sysb.listing.events',
        async (msg) => {
          if (!msg) return;
          await this.handleMessage(msg);
        },
        { noAck: false },
      );
    } catch (error) {
      this.logger.error(`Failed to connect to RabbitMQ: ${error.message}. Retrying in 5s...`);
      setTimeout(() => this.connectWithRetry(), 5000);
    }
  }

  private async handleMessage(msg: amqp.ConsumeMessage) {
    const routingKey = msg.fields.routingKey;
    const messageId = msg.properties.messageId || 'N/A';
    const timestamp = msg.properties.timestamp ? new Date(msg.properties.timestamp).toISOString() : new Date().toISOString();

    this.logger.log(`Received message [${routingKey}] ID: ${messageId} at ${timestamp}`);

    try {
      const payload = JSON.parse(msg.content.toString());

      switch (routingKey) {
        case 'listing.created': {
          await this.listingIndexService.indexListing(payload);
          await this.geoService.upsertSupplierLocation(
            payload.supplierId,
            payload.supplierName,
            payload.longitude,
            payload.latitude,
            payload.address || '',
            [payload.category],
          );
          break;
        }

        case 'listing.updated': {
          await this.listingIndexService.updateListing(payload.id, payload);
          const activeCount = payload.quantity > 0 ? 1 : 0;
          const categories = payload.category ? [payload.category] : [];
          await this.geoService.updateListingStats(payload.supplierId, categories, activeCount);
          break;
        }

        case 'listing.deleted': {
          await this.listingIndexService.deleteListing(payload.id);
          break;
        }

        default:
          this.logger.warn(`Unhandled routing key: ${routingKey}`);
      }

      this.channel.ack(msg);
    } catch (error) {
      this.logger.error(`Error processing message [${routingKey}]: ${error.message}`);
      this.handleRetry(msg);
    }
  }

  private handleRetry(msg: amqp.ConsumeMessage) {
    const currentRetries = (msg.properties.headers && msg.properties.headers['x-retry-count']) || 0;
    const newRetryCount = currentRetries + 1;

    if (newRetryCount >= 3) {
      this.logger.error(`Max retries (3) reached for message ID ${msg.properties.messageId || 'N/A'}. Discarding message.`);
      this.channel.nack(msg, false, false); // NACK with requeue: false
    } else {
      this.logger.warn(`Requeueing message (Attempt ${newRetryCount}/3)`);
      const headers = { ...msg.properties.headers, 'x-retry-count': newRetryCount };
      
      // Publish back to exchange with updated headers and NACK original
      this.channel.publish(
        msg.fields.exchange,
        msg.fields.routingKey,
        msg.content,
        { headers, messageId: msg.properties.messageId }
      );
      this.channel.ack(msg);
    }
  }
}