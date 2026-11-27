import { createHash } from 'node:crypto';
import type { RequestHandler } from 'express';
import { Session } from '../../modules/auth/session.model.js';

export const authenticate: RequestHandler = async (request, response, next) => {
  const authorization = request.header('authorization');
  const match = authorization?.match(/^Bearer ([\da-f]{64})$/i);

  if (!match) {
    response.status(401).json({ error: 'Authentication required' });
    return;
  }

  const tokenHash = createHash('sha256').update(match[1]!).digest('hex');
  const session = await Session.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  }).select('userId');

  if (!session) {
    response.status(401).json({ error: 'Invalid or expired session' });
    return;
  }

  response.locals.userId = session.userId.toString();
  next();
};
