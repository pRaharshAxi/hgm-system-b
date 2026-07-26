/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

import { Notification, NotificationSchema } from './schemas/notification.schema';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { HarvestScheduler } from './harvest.scheduler';
import { JwtVerifyGuard } from '../../common/guards/jwt-verify.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    ScheduleModule.forRoot(),
    ConfigModule,
    JwtModule.register({}),
    ElasticsearchModule.registerAsync({
      useFactory: () => ({
        node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
      }),
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, HarvestScheduler, JwtVerifyGuard],
  exports: [NotificationsService],
})
export class NotificationsModule {}