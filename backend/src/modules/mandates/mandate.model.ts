import { Schema, Types, model } from 'mongoose';
import { mandateStatuses, type MandateStatus } from './mandate-status.js';

export interface MandateRecord {
  mandateId: string;
  payerUserId: Types.ObjectId;
  payerWallet: string;
  agentId: string;
  agentOwnerId: Types.ObjectId;
  recipientWallet?: string;
  taskId?: string;
  chainId: number;
  tokenAddress?: string;
  tokenSymbol: string;
  amount: string;
  amountBaseUnits?: string;
  nonce?: string;
  signatureReference?: string;
  deadline?: Date;
  status: MandateStatus;
  signatureStatus: 'not_requested' | 'pending' | 'authorized' | 'rejected';
  executionStatus: 'not_started' | 'submitted' | 'settled' | 'failed';
  verificationStatus: 'unverified' | 'verified' | 'failed';
  failureCode?: string;
  hspReceiptReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const mandateSchema = new Schema<MandateRecord>(
  {
    mandateId: { type: String, required: true, unique: true, immutable: true },
    payerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    payerWallet: { type: String, required: true, lowercase: true },
    agentId: { type: String, required: true, index: true },
    agentOwnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientWallet: { type: String, lowercase: true },
    taskId: { type: String },
    chainId: { type: Number, required: true },
    tokenAddress: { type: String, lowercase: true },
    tokenSymbol: { type: String, required: true, uppercase: true },
    amount: { type: String, required: true },
    amountBaseUnits: { type: String, match: /^\d+$/ },
    nonce: { type: String },
    signatureReference: { type: String },
    deadline: { type: Date },
    status: { type: String, enum: mandateStatuses, default: 'DRAFT', required: true },
    signatureStatus: {
      type: String,
      enum: ['not_requested', 'pending', 'authorized', 'rejected'],
      default: 'not_requested',
      required: true,
    },
    executionStatus: {
      type: String,
      enum: ['not_started', 'submitted', 'settled', 'failed'],
      default: 'not_started',
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'verified', 'failed'],
      default: 'unverified',
      required: true,
    },
    failureCode: { type: String },
    hspReceiptReference: { type: String },
  },
  { timestamps: true },
);

mandateSchema.index({ payerUserId: 1, createdAt: -1 });
mandateSchema.index({ agentOwnerId: 1, createdAt: -1 });

export const Mandate = model<MandateRecord>('Mandate', mandateSchema);
