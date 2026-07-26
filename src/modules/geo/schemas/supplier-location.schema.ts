/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SupplierLocationDocument = SupplierLocation & Document;

@Schema({ timestamps: true })
export class SupplierLocation {
  @Prop({ required: true, unique: true, index: true })
  supplierId: string;

  @Prop({ required: true })
  supplierName: string;

  @Prop()
  address?: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  })
  location: {
    type: string;
    coordinates: number[];
  };

  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop({ default: 0 })
  activeListingCount: number;
}

export const SupplierLocationSchema = SchemaFactory.createForClass(SupplierLocation);

// Ensure 2dsphere index is created on the GeoJSON location field
SupplierLocationSchema.index({ location: '2dsphere' });