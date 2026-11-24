import { Schema, model, type InferSchemaType } from 'mongoose'

const userSchema = new Schema({
  walletAddress: { type: String, required: true, unique: true, lowercase: true, index: true },
  nonce: { type: String, required: true },
  nonceExpiresAt: { type: Date, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user', required: true }
}, { timestamps: true })

export type UserDocument = InferSchemaType<typeof userSchema>
export const User = model('User', userSchema)
