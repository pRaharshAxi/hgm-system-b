import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type PaymentLogDocument = HydratedDocument<PaymentLog>;

@Schema({ timestamps: false })
export class PaymentLog extends Document {
  @Prop({ required: true, index: true })
  orderId!: string;

  @Prop({ required: true, unique: true })
  stripeSessionId!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  currency!: string;

  @Prop({
    required: true,
    enum: ['pending', 'paid', 'failed', 'expired'],
    default: 'pending',
  })
  status!: string;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, any>;

  @Prop({ type: Date, default: null })
  paidAt!: Date | null;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const PaymentLogSchema = SchemaFactory.createForClass(PaymentLog);
