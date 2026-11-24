import { Router } from 'express'
import { randomBytes } from 'node:crypto'
import { verifyMessage } from 'ethers'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { User } from '../models/User.js'
import { env, adminWallets } from '../config/env.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const walletSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'A valid EVM wallet address is required.')

router.post('/nonce', asyncHandler(async (req, res) => {
  const { walletAddress } = z.object({ walletAddress: walletSchema }).parse(req.body)
  const normalized = walletAddress.toLowerCase()
  const nonce = randomBytes(24).toString('hex')
  const nonceExpiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await User.findOneAndUpdate(
    { walletAddress: normalized },
    { $set: { nonce, nonceExpiresAt }, $setOnInsert: { walletAddress: normalized, role: 'user' } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  const message = [
    'Sign in to MandateFlow',
    '',
    'This signature proves wallet ownership. It does not authorize a token transfer.',
    `Wallet: ${normalized}`,
    `Nonce: ${nonce}`,
    `Issued At: ${new Date().toISOString()}`,
    'Expires In: 5 minutes'
  ].join('\n')

  res.json({ message, expiresAt: nonceExpiresAt })
}))

router.post('/verify', asyncHandler(async (req, res) => {
  const body = z.object({
    walletAddress: walletSchema,
    message: z.string().min(20).max(1500),
    signature: z.string().regex(/^0x[a-fA-F0-9]+$/)
  }).parse(req.body)

  const normalized = body.walletAddress.toLowerCase()
  const user = await User.findOne({ walletAddress: normalized })
  if (!user || user.nonceExpiresAt.getTime() < Date.now()) {
    res.status(401).json({ message: 'Sign-in challenge expired. Request a new one.' })
    return
  }

  const expectedNonceLine = `Nonce: ${user.nonce}`
  if (!body.message.includes(expectedNonceLine) || !body.message.includes(`Wallet: ${normalized}`)) {
    res.status(401).json({ message: 'Sign-in message does not match the issued challenge.' })
    return
  }

  let recovered: string
  try {
    recovered = verifyMessage(body.message, body.signature).toLowerCase()
  } catch {
    res.status(401).json({ message: 'Wallet signature could not be verified.' })
    return
  }

  if (recovered !== normalized) {
    res.status(401).json({ message: 'Signature does not belong to the supplied wallet.' })
    return
  }

  user.nonce = randomBytes(24).toString('hex')
  user.nonceExpiresAt = new Date(0)
  if (adminWallets.has(normalized)) user.role = 'admin'
  await user.save()

  const token = jwt.sign(
    { sub: user.id, walletAddress: normalized, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  )

  res.json({
    token,
    user: { id: user.id, walletAddress: normalized, role: user.role }
  })
}))

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json({ user: req.user })
}))

export default router
