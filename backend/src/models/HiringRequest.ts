import { Schema, model } from 'mongoose'

const hiringRequestSchema = new Schema({
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  agent: { type: Schema.Types.ObjectId, ref: 'Agent', required: true, index: true },
  taskTitle: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  requirements: { type: String, default: '', maxlength: 5000 },
  budget: { type: Number, required: true, min: 0.000001 },
  currency: { type: String, enum: ['USDC'], default: 'USDC' },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined', 'In Progress', 'Submitted', 'Completed', 'Cancelled'], default: 'Pending', index: true },
  responseNote: { type: String, default: '', maxlength: 2000 },
  respondedAt: { type: Date, default: null }
}, { timestamps: true })

hiringRequestSchema.index({ agent: 1, status: 1, createdAt: -1 })
export const HiringRequest = model('HiringRequest', hiringRequestSchema)
