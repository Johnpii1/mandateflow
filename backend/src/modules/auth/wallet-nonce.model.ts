import { Schema, model, Types } from 'mongoose';

interface WalletNonceRecord {
  userId: Types.ObjectId;
  address: string;
  chainId: number;
  nonce: string;
  message: string;
  expiresAt: Date;
}

const walletNonceSchema = new Schema<WalletNonceRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    address: { type: String, required: true, lowercase: true },
    chainId: { type: Number, required: true },
    nonce: { type: String, required: true, unique: true },
    message: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

walletNonceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const WalletNonce = model<WalletNonceRecord>('WalletNonce', walletNonceSchema);
