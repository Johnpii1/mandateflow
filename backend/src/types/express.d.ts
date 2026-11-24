import type { Types } from 'mongoose'

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; walletAddress: string; role: 'user' | 'admin' }
      userId?: Types.ObjectId
    }
  }
}

export {}
