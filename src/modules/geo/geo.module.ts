/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { GeoController } from './geo.controller';
import { GeoService } from './geo.service';
import { SupplierLocation, SupplierLocationSchema } from './schemas/supplier-location.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupplierLocation.name, schema: SupplierLocationSchema },
    ]),
    CacheModule.register(),
  ],
  controllers: [GeoController],
  providers: [GeoService],
  exports: [GeoService],
})
export class GeoModule {}