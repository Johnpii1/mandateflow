import { Router } from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import { Agent } from '../models/Agent.js'
import { HiringRequest } from '../models/HiringRequest.js'
import { WorkSubmission } from '../models/WorkSubmission.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const objectId = (value: string) => mongoose.Types.ObjectId.isValid(value)

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const input = z.object({
    agentId: z.string().refine(objectId, 'Invalid agent ID.'),
    taskTitle: z.string().trim().min(3).max(140),
    description: z.string().trim().min(10).max(5000),
    requirements: z.string().trim().max(5000).default(''),
    budget: z.number().positive().finite(),
    currency: z.literal('USDC').default('USDC'),
    deadline: z.coerce.date()
  }).parse(req.body)

  if (input.deadline.getTime() < Date.now()) {
    res.status(400).json({ message: 'Deadline must be in the future.' })
    return
  }

  const agent = await Agent.findOne({ _id: input.agentId, status: 'Active' })
  if (!agent) {
    res.status(404).json({ message: 'Active agent not found.' })
    return
  }
  if (agent.owner.toString() === req.user!.id) {
    res.status(400).json({ message: 'You cannot send a hiring request to your own agent.' })
    return
  }

  const request = await HiringRequest.create({
    requester: req.user!.id,
    agent: agent._id,
    taskTitle: input.taskTitle,
    description: input.description,
    requirements: input.requirements,
    budget: input.budget,
    currency: input.currency,
    deadline: input.deadline
  })
  res.status(201).json({ message: 'Hiring request delivered to the agent owner inbox.', request })
}))

router.get('/sent', requireAuth, asyncHandler(async (req, res) => {
  const requests = await HiringRequest.find({ requester: req.user!.id })
    .populate('agent', 'name category owner')
    .sort({ createdAt: -1 })
  res.json({ requests })
}))

router.get('/inbox', requireAuth, asyncHandler(async (req, res) => {
  const ownedAgents = await Agent.find({ owner: req.user!.id }).select('_id')
  const agentIds = ownedAgents.map((agent) => agent._id)
  const requests = await HiringRequest.find({ agent: { $in: agentIds } })
    .populate('agent', 'name category')
    .populate('requester', 'walletAddress')
    .sort({ createdAt: -1 })
  res.json({ requests })
}))

router.patch('/:id/respond', requireAuth, asyncHandler(async (req, res) => {
  const input = z.object({
    decision: z.enum(['accept', 'decline']),
    responseNote: z.string().trim().max(2000).default('')
  }).parse(req.body)

  const request = await HiringRequest.findById(req.params.id).populate('agent')
  if (!request) {
    res.status(404).json({ message: 'Hiring request not found.' })
    return
  }
  const agent = request.agent as unknown as { owner: mongoose.Types.ObjectId }
  if (agent.owner.toString() !== req.user!.id) {
    res.status(403).json({ message: 'Only the agent owner can respond to this request.' })
    return
  }
  if (request.status !== 'Pending') {
    res.status(409).json({ message: 'This request has already been answered or progressed.' })
    return
  }

  request.status = input.decision === 'accept' ? 'Accepted' : 'Declined'
  request.responseNote = input.responseNote
  request.respondedAt = new Date()
  await request.save()
  res.json({ message: input.decision === 'accept' ? 'Request accepted.' : 'Request declined.', request })
}))

router.post('/:id/submit-work', requireAuth, asyncHandler(async (req, res) => {
  const input = z.object({
    summary: z.string().trim().min(10).max(3000),
    deliverableUrl: z.string().trim().url().optional().or(z.literal('')),
    evidence: z.array(z.string().trim().url()).max(10).default([])
  }).parse(req.body)

  const request = await HiringRequest.findById(req.params.id).populate('agent')
  if (!request) {
    res.status(404).json({ message: 'Hiring request not found.' })
    return
  }
  const agent = request.agent as unknown as { _id: mongoose.Types.ObjectId; owner: mongoose.Types.ObjectId }
  if (agent.owner.toString() !== req.user!.id) {
    res.status(403).json({ message: 'Only the assigned agent owner can submit work.' })
    return
  }
  if (!['Accepted', 'In Progress'].includes(request.status)) {
    res.status(409).json({ message: 'Only accepted requests can receive a work submission.' })
    return
  }

  const submission = await WorkSubmission.create({
    request: request._id,
    agent: agent._id,
    submittedBy: req.user!.id,
    ...input
  })
  request.status = 'Submitted'
  await request.save()
  res.status(201).json({ message: 'Work submitted for requester review.', submission })
}))

router.get('/:id/submission', requireAuth, asyncHandler(async (req, res) => {
  const request = await HiringRequest.findById(req.params.id).populate('agent')
  if (!request) {
    res.status(404).json({ message: 'Hiring request not found.' })
    return
  }
  const agent = request.agent as unknown as { owner: mongoose.Types.ObjectId }
  const isOwner = agent.owner.toString() === req.user!.id
  const isRequester = request.requester.toString() === req.user!.id
  if (!isOwner && !isRequester) {
    res.status(403).json({ message: 'You do not have access to this submission.' })
    return
  }
  const submission = await WorkSubmission.findOne({ request: request._id })
  res.json({ submission })
}))

router.patch('/:id/review-work', requireAuth, asyncHandler(async (req, res) => {
  const input = z.object({
    decision: z.enum(['approve', 'needs_changes']),
    reviewerNote: z.string().trim().max(2000).default('')
  }).parse(req.body)

  const request = await HiringRequest.findById(req.params.id).populate('agent')
  if (!request) {
    res.status(404).json({ message: 'Hiring request not found.' })
    return
  }
  if (request.requester.toString() !== req.user!.id) {
    res.status(403).json({ message: 'Only the requester can review submitted work.' })
    return
  }
  if (request.status !== 'Submitted') {
    res.status(409).json({ message: 'This request has no submission awaiting review.' })
    return
  }
  const submission = await WorkSubmission.findOne({ request: request._id })
  if (!submission) {
    res.status(404).json({ message: 'Work submission not found.' })
    return
  }

  submission.reviewStatus = input.decision === 'approve' ? 'Approved' : 'Needs Changes'
  submission.reviewerNote = input.reviewerNote
  submission.reviewedAt = new Date()
  await submission.save()
  request.status = input.decision === 'approve' ? 'Completed' : 'In Progress'
  await request.save()
  res.json({ message: 'Work review recorded.', request, submission })
}))

export default router
