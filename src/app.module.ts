import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Config Imports
import { envValidationSchema } from './config/env.validation';
import { mongodbConfig } from './config/mongodb.config';
import { redisConfig } from './config/redis.config';
import { elasticsearchProvider } from './config/elasticsearch.config';

@Module({
  imports: [
    // 1. Global config initialization with runtime schema enforcement
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: true, // App crashes immediately if a variable is missing
      },
    }),

    // 2. Async Database connectivity
    MongooseModule.forRootAsync(mongodbConfig),

    // 3. Cache Manager utilizing Redis store adapter
    CacheModule.registerAsync(redisConfig),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    elasticsearchProvider, // Global accessibility hook for client injection
  ],
})
export class AppModule {}
