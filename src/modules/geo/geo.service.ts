/* eslint-disable prettier/prettier, @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SupplierLocation, SupplierLocationDocument } from './schemas/supplier-location.schema';

@Injectable()
export class GeoService {
  constructor(
    @InjectModel(SupplierLocation.name)
    private readonly supplierLocationModel: Model<SupplierLocationDocument>,
  ) {}

  async upsertSupplierLocation(
    supplierId: string,
    supplierName: string,
    lng: number,
    lat: number,
    address?: string,
    categories?: string[],
  ) {
    return this.supplierLocationModel.findOneAndUpdate(
      { supplierId },
      {
        $set: {
          supplierName,
          address,
          // MongoDB GeoJSON order: [longitude, latitude]
          location: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)],
          },
          ...(categories ? { categories } : {}),
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
  }

  async findNearby(lat: number, lng: number, radiusKm: number = 10, category?: string) {
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    const parsedRadius = radiusKm !== undefined && !isNaN(Number(radiusKm)) ? Number(radiusKm) : 10;

    const pipeline: any[] = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parsedLng, parsedLat], // [longitude, latitude]
          },
          distanceField: 'distanceMeters',
          maxDistance: parsedRadius * 1000,
          spherical: true,
        },
      },
    ];

    if (category) {
      pipeline.push({
        $match: {
          categories: category.toUpperCase(),
        },
      });
    }

    pipeline.push(
      {
        $addFields: {
          distanceKm: {
            $round: [{ $divide: ['$distanceMeters', 1000] }, 2],
          },
          latitude: { $arrayElemAt: ['$location.coordinates', 1] },
          longitude: { $arrayElemAt: ['$location.coordinates', 0] },
        },
      },
      {
        $project: {
          _id: 0,
          supplierId: 1,
          supplierName: 1,
          address: 1,
          distanceKm: 1,
          latitude: 1,
          longitude: 1,
          categories: 1,
          activeListingCount: 1,
        },
      },
    );

    return this.supplierLocationModel.aggregate(pipeline);
  }

  async updateListingStats(supplierId: string, categories: string[], activeListingCount: number) {
    return this.supplierLocationModel.findOneAndUpdate(
      { supplierId },
      {
        $set: {
          categories,
          activeListingCount,
        },
      },
      { returnDocument: 'after' },
    );
  }
}