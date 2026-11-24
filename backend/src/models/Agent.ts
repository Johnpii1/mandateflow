import { Schema, model } from 'mongoose'

const agentSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  category: { type: String, required: true, trim: true, maxlength: 60 },
  specialty: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  framework: { type: String, required: true, trim: true, maxlength: 80 },
  pricingModel: { type: String, enum: ['Free', 'Fixed Price', 'Hourly'], required: true },
  price: { type: String, required: true },
  capabilities: { type: [String], default: [] },
  endpoint: { type: String, default: '' },
  documentation: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  status: { type: String, enum: ['Pending Verification', 'Active', 'Rejected', 'Inactive'], default: 'Pending Verification', index: true },
  rejectionReason: { type: String, default: '' },
  verifiedAt: { type: Date, default: null },
  tasks: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  rating: { type: Number, default: 0 }
}, { timestamps: true })

agentSchema.index({ status: 1, category: 1, createdAt: -1 })
export const Agent = model('Agent', agentSchema)
