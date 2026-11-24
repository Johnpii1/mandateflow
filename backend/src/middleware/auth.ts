import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required.' })
      return
    }

    const token = header.slice(7)
    const payload = jwt.verify(token, env.JWT_SECRET)
    if (typeof payload === 'string' || !payload.sub) {
      res.status(401).json({ message: 'Invalid authentication token.' })
      return
    }

    const user = await User.findById(payload.sub).select('_id walletAddress role')
    if (!user) {
      res.status(401).json({ message: 'Account not found.' })
      return
    }

    req.user = {
      id: user.id,
      walletAddress: user.walletAddress,
      role: user.role as 'user' | 'admin'
    }
    next()
  } catch {
    res.status(401).json({ message: 'Session is invalid or expired. Please reconnect your wallet.' })
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Administrator access required.' })
    return
  }
  next()
}
