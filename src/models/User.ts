import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from '@/lib/types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  passwordHash: string;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  },
  {
    timestamps: true,
  }
);

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
