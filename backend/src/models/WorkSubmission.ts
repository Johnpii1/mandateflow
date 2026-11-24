import { Schema, model } from 'mongoose'

const workSubmissionSchema = new Schema({
  request: { type: Schema.Types.ObjectId, ref: 'HiringRequest', required: true, unique: true },
  agent: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  summary: { type: String, required: true, trim: true, maxlength: 3000 },
  deliverableUrl: { type: String, default: '' },
  evidence: { type: [String], default: [] },
  reviewStatus: { type: String, enum: ['Pending Review', 'Approved', 'Needs Changes'], default: 'Pending Review' },
  reviewerNote: { type: String, default: '', maxlength: 2000 },
  reviewedAt: { type: Date, default: null }
}, { timestamps: true })

export const WorkSubmission = model('WorkSubmission', workSubmissionSchema)
