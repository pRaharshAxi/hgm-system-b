/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { envValidationSchema } from './config/env.validation';
import { SearchModule } from './modules/search/search.module';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/hgm_db'),
    CacheModule.register({
      isGlobal: true,
      ttl: 60000,
    }),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_NODE', 'http://localhost:9200'),
        auth: {
          username: configService.get<string>('ELASTICSEARCH_USERNAME', 'elastic'),
          password: configService.get<string>('ELASTICSEARCH_PASSWORD', 'hgm_elastic_password'),
        },
      }),
      inject: [ConfigService],
    }),
    SearchModule,
    MessagingModule,
  ],
})
export class AppModule {}
