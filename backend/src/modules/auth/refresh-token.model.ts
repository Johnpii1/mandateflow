import { Schema, model, Types } from 'mongoose';

/**
 * Refresh token stored in DB. The plain token is only ever sent as an HttpOnly
 * cookie; only a SHA‑256 hash is persisted.
 */
interface RefreshTokenRecord {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// TTL index – MongoDB will automatically delete expired documents.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<RefreshTokenRecord>('RefreshToken', refreshTokenSchema);
