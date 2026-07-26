import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: false })
export class Notification extends Document {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({
    required: true,
    enum: [
      'ORDER_PLACED',
      'ORDER_STATUS_UPDATED',
      'HARVEST_ALERT',
      'PAYMENT_FAILED',
    ],
  })
  type!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  body!: string;

  @Prop({ default: false })
  isRead!: boolean;

  @Prop({
    type: {
      orderId: String,
      listingId: String,
      supplierId: String,
      buyerName: String,
      listingTitle: String,
    },
    default: {},
  })
  metadata!: {
    orderId?: string;
    listingId?: string;
    supplierId?: string;
    buyerName?: string;
    listingTitle?: string;
  };

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Compound Index setup
NotificationSchema.index({ userId: 1, isRead: 1 });
