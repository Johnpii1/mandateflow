import { Router } from 'express'
import { z } from 'zod'
import { Agent } from '../models/Agent.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

const router = Router()
const httpUrl = z.string().trim().url().refine((value) => /^https?:\/\//i.test(value), 'Only HTTP and HTTPS URLs are allowed.')
const agentInput = z.object({
  name: z.string().trim().min(2).max(80),
  category: z.string().trim().min(2).max(60),
  specialty: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(3000),
  framework: z.string().trim().min(2).max(80),
  pricingModel: z.enum(['Free', 'Fixed Price', 'Hourly']),
  price: z.string().trim().max(40),
  capabilities: z.array(z.string().trim().min(1).max(80)).min(1).max(12),
  endpoint: z.union([httpUrl, z.literal('')]).default(''),
  documentation: z.union([httpUrl, z.literal('')]).default(''),
  imageUrl: z.union([httpUrl, z.literal('')]).default('')
}).superRefine((data, ctx) => {
  if (data.pricingModel !== 'Free' && (!Number.isFinite(Number(data.price)) || Number(data.price) <= 0)) {
    ctx.addIssue({ code: 'custom', path: ['price'], message: 'A positive price is required for paid pricing models.' })
  }
})

router.get('/', asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = { status: 'Active' }
  if (typeof req.query.category === 'string' && req.query.category.trim()) {
    filter.category = req.query.category.trim()
  }
  const agents = await Agent.find(filter).select('-owner -__v').sort({ createdAt: -1 }).limit(100)
  res.json({ agents })
}))

router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  const agents = await Agent.find({ owner: req.user!.id }).sort({ createdAt: -1 })
  res.json({ agents })
}))

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const input = agentInput.parse(req.body)
  const agent = await Agent.create({ ...input, owner: req.user!.id, price: input.pricingModel === 'Free' ? '0' : input.price })
  res.status(201).json({ message: 'Agent submitted for verification.', agent })
}))

router.get('/admin/review', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : 'Pending Verification'
  if (!['Pending Verification', 'Active', 'Rejected'].includes(status)) {
    res.status(400).json({ message: 'Unsupported review status.' })
    return
  }
  const agents = await Agent.find({ status }).populate('owner', 'walletAddress').sort({ createdAt: -1 })
  res.json({ agents })
}))

router.patch('/:id/review', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const input = z.object({
    decision: z.enum(['approve', 'reject']),
    rejectionReason: z.string().trim().max(1000).optional()
  }).parse(req.body)

  const agent = await Agent.findById(req.params.id)
  if (!agent) {
    res.status(404).json({ message: 'Agent not found.' })
    return
  }
  if (agent.status !== 'Pending Verification') {
    res.status(409).json({ message: 'Only pending agents can be reviewed.' })
    return
  }
  if (input.decision === 'reject' && !input.rejectionReason?.trim()) {
    res.status(400).json({ message: 'A reason is required when rejecting an agent.' })
    return
  }

  agent.status = input.decision === 'approve' ? 'Active' : 'Rejected'
  agent.rejectionReason = input.decision === 'reject' ? input.rejectionReason!.trim() : ''
  agent.verifiedAt = new Date()
  await agent.save()
  res.json({ message: `Agent ${input.decision === 'approve' ? 'approved' : 'rejected'}.`, agent })
}))

export default router
