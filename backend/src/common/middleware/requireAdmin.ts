import type { RequestHandler } from 'express';
import { User } from '../../modules/users/user.model.js';

/**
 * Middleware that ensures the authenticated user has the "admin" role.
 * Relies on `authenticate` middleware having set `response.locals.userId`.
 */
export const requireAdmin: RequestHandler = async (request, response, next) => {
  const userId = response.locals.userId as string | undefined;
  if (!userId) {
    response.status(401).json({ error: 'Authentication required' });
    return;
  }

  const user = await User.findById(userId).select('role');
  if (!user) {
    response.status(404).json({ error: 'User not found' });
    return;
  }

  if (user.role !== 'admin') {
    response.status(403).json({ error: 'Admin privilege required' });
    return;
  }

  next();
};
