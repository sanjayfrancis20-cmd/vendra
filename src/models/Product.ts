import mongoose, { Schema, Document, Model } from 'mongoose';
import { IProduct } from '@/lib/types';

export interface IProductDocument extends Omit<IProduct, '_id'>, Document {}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    category: { type: String, required: true, index: true },
    image: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 12 },
    featured: { type: Boolean, default: false },
    tags: [{ type: String }],
    specs: { type: Map, of: String },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in Next.js hot reload
export const ProductModel: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);
