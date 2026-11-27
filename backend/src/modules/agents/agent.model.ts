import { Schema, Types, model } from 'mongoose';

export type AgentStatus = 'draft' | 'active' | 'suspended' | 'archived';
export type PricingModel = 'fixed' | 'hourly' | 'per-task';

export interface AgentRecord {
  agentId: string;
  ownerId: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  avatarUrl?: string;
  category: string;
  capabilities: string[];
  serviceDescription: string;
  pricing: {
    model: PricingModel;
    amount: string;
    token: string;
    chainId: number;
  };
  endpointUrl?: string;
  status: AgentStatus;
  verificationStatus: 'unverified' | 'pending' | 'verified';
  isDiscoverable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const agentSchema = new Schema<AgentRecord>(
  {
    agentId: { type: String, required: true, unique: true, immutable: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    avatarUrl: { type: String, trim: true, maxlength: 2048 },
    category: { type: String, required: true, trim: true, lowercase: true, maxlength: 50 },
    capabilities: { type: [String], required: true, default: [] },
    serviceDescription: { type: String, required: true, trim: true, maxlength: 2000 },
    pricing: {
      model: { type: String, enum: ['fixed', 'hourly', 'per-task'], required: true },
      amount: { type: String, required: true },
      token: { type: String, required: true, uppercase: true },
      chainId: { type: Number, required: true },
    },
    endpointUrl: { type: String, trim: true, maxlength: 2048 },
    status: { type: String, enum: ['draft', 'active', 'suspended', 'archived'], default: 'draft', required: true },
    verificationStatus: { type: String, enum: ['unverified', 'pending', 'verified'], default: 'unverified', required: true },
    isDiscoverable: { type: Boolean, default: false, required: true },
  },
  { timestamps: true },
);

agentSchema.index({ ownerId: 1, createdAt: -1 });
agentSchema.index({ status: 1, isDiscoverable: 1 });
agentSchema.index({ status: 1, isDiscoverable: 1, category: 1 });
agentSchema.index({ status: 1, isDiscoverable: 1, capabilities: 1 });

export const Agent = model<AgentRecord>('Agent', agentSchema);
