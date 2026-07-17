import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type SupplierLocationDocument = HydratedDocument<SupplierLocation>;

@Schema()
export class SupplierLocation extends Document {
  @Prop({ required: true, unique: true, index: true })
  supplierId!: string;

  @Prop({ required: true })
  supplierName!: string;

  @Prop({ required: true })
  address!: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
    _id: false,
  })
  location!: {
    type: string;
    coordinates: number[];
  };

  @Prop({ type: [String], default: [] })
  categories!: string[];

  @Prop({ default: 0 })
  activeListingCount!: number;
}

export const SupplierLocationSchema =
  SchemaFactory.createForClass(SupplierLocation);

// 2dsphere Geo Index setup
SupplierLocationSchema.index({ location: '2dsphere' });
