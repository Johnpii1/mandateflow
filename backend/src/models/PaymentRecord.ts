import { Schema, model } from 'mongoose'

const paymentRecordSchema = new Schema({
  request: { type: Schema.Types.ObjectId, ref: 'HiringRequest', required: true, index: true },
  payer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipientWallet: { type: String, required: true, lowercase: true },
  token: { type: String, required: true, default: 'USDC' },
  amount: { type: String, required: true },
  chainId: { type: Number, required: true },
  mandateId: { type: String, default: '' },
  transactionHash: { type: String, default: '' },
  hspPaymentId: { type: String, default: '' },
  status: { type: String, enum: ['Draft', 'Authorized', 'Submitted', 'Observed', 'Receipt Issued', 'Failed'], default: 'Draft', index: true }
}, { timestamps: true })

export const PaymentRecord = model('PaymentRecord', paymentRecordSchema)
