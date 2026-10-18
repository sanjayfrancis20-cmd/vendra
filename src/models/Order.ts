import mongoose, { Schema, Document, Model } from 'mongoose';
import { IOrder } from '@/lib/types';

export interface IOrderDocument extends Omit<IOrder, '_id'>, Document {}

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: String },
    customerEmail: { type: String, required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String },
    shippingAddress: {
      street: { type: String, required: true },
      apartment: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String },
      deliveryNotes: { type: String },
      shippingMethod: { type: String, default: 'standard' },
    },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'ready_for_delivery', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'paid',
    },
    paymentMethod: {
      type: String,
      enum: ['stripe_test', 'card', 'upi', 'cod', 'net_banking'],
      default: 'stripe_test',
    },
    paymentDetails: {
      cardBrand: { type: String },
      cardLast4: { type: String },
      upiId: { type: String },
      bankName: { type: String },
    },
    paymentId: { type: String },
  },
  {
    timestamps: true,
  }
);

export const OrderModel: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);
