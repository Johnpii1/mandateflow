import { Router } from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import { Agent } from '../models/Agent.js'
import { HiringRequest } from '../models/HiringRequest.js'
import { PaymentRecord } from '../models/PaymentRecord.js'
import { User } from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/intent', requireAuth, asyncHandler(async (req, res) => {
  const input = z.object({
    requestId: z.string().refine(mongoose.Types.ObjectId.isValid, 'Invalid request ID.'),
    chainId: z.union([z.literal(133), z.literal(177)])
  }).parse(req.body)

  const request = await HiringRequest.findOne({ _id: input.requestId, requester: req.user!.id }).populate('agent')
  if (!request) {
    res.status(404).json({ message: 'Your hiring request was not found.' })
    return
  }
  if (!['Accepted', 'In Progress', 'Submitted'].includes(request.status)) {
    res.status(409).json({ message: 'The request must be accepted before a payment intent can be created.' })
    return
  }

  const agent = request.agent as unknown as { owner: mongoose.Types.ObjectId }
  const recipient = await User.findById(agent.owner).select('walletAddress')
  if (!recipient) {
    res.status(404).json({ message: 'Agent owner account not found.' })
    return
  }

  const payment = await PaymentRecord.create({
    request: request._id,
    payer: req.user!.id,
    recipientWallet: recipient.walletAddress,
    amount: String(request.budget),
    token: request.currency,
    chainId: input.chainId,
    status: 'Draft'
  })
  res.status(201).json({
    message: 'Payment intent created. No wallet transaction has been sent and no funds have moved.',
    payment,
    nextStep: 'The frontend must obtain the documented HSP mandate and wallet signature before submitting a transaction.'
  })
}))

router.patch('/:id/transaction', requireAuth, asyncHandler(async (req, res) => {
  const input = z.object({
    transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'A valid transaction hash is required.')
  }).parse(req.body)

  const payment = await PaymentRecord.findOne({ _id: req.params.id, payer: req.user!.id })
  if (!payment) {
    res.status(404).json({ message: 'Payment record not found.' })
    return
  }
  if (payment.status !== 'Draft') {
    res.status(409).json({ message: 'This payment record can no longer accept a transaction hash.' })
    return
  }

  payment.transactionHash = input.transactionHash
  payment.status = 'Submitted'
  await payment.save()
  res.json({
    message: 'Transaction hash recorded. Settlement has not yet been independently verified.',
    payment
  })
}))

router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  const payments = await PaymentRecord.find({ payer: req.user!.id }).sort({ createdAt: -1 })
  res.json({ payments })
}))

export default router
