import { Schema, model } from 'mongoose';

export interface UserRecord {
  email: string;
  passwordHash: string;
  displayName: string;
  status: 'active' | 'disabled';
  role: 'user' | 'admin'; // new role field
  wallets: Array<{
    address: string;
    chainId: number;
    isPrimary: boolean;
    verifiedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserRecord>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    displayName: { type: String, required: true, trim: true, maxlength: 80 },
    status: { type: String, enum: ['active', 'disabled'], default: 'active', required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', required: true }, // new field
    wallets: {
      type: [{
        address: { type: String, required: true, lowercase: true },
        chainId: { type: Number, required: true },
        isPrimary: { type: Boolean, default: false },
        verifiedAt: { type: Date, required: true },
      }],
      default: [],
    },
  },
  { timestamps: true },
);

userSchema.index({ 'wallets.address': 1 }, { unique: true, sparse: true });

export const User = model<UserRecord>('User', userSchema);
