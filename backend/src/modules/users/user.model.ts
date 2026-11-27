import { Schema, model } from 'mongoose';

export interface UserRecord {
  email: string;
  passwordHash: string;
  displayName: string;
  status: 'active' | 'disabled';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserRecord>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    displayName: { type: String, required: true, trim: true, maxlength: 80 },
    status: { type: String, enum: ['active', 'disabled'], default: 'active', required: true },
  },
  { timestamps: true },
);

export const User = model<UserRecord>('User', userSchema);
