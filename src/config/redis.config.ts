import { CacheModuleAsyncOptions, CacheOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';

export const redisConfig: CacheModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const store = await redisStore({
      host: configService.get<string>('REDIS_HOST')!,
      port: configService.get<number>('REDIS_PORT')!,
      ttl: 60 * 1000,
    });

    return {
      store,
    } as CacheOptions;
  },
};
