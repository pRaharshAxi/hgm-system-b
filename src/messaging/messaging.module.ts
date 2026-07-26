/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ListingConsumerService } from './listing-consumer.service';
import { OrderConsumerService } from './order-consumer.service';
import { SearchModule } from '../modules/search/search.module';
import { GeoModule } from '../modules/geo/geo.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
          queue: 'sysb.listing.events',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    SearchModule,
    GeoModule,
    NotificationsModule,
  ],
  providers: [ListingConsumerService, OrderConsumerService],
  exports: [ListingConsumerService, OrderConsumerService],
})
export class MessagingModule {}