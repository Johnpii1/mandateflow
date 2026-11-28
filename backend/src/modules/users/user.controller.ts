import type { RequestHandler } from 'express';
import { User } from './user.model.js';
import { AppError } from '../../common/errors/AppError.js';

/**
 * PATCH /me – update current user's profile.
 * Allowed fields: displayName, email, and (if admin) role.
 */
export const updateMeController: RequestHandler = async (req, res) => {
  const userId = res.locals.userId as string;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { displayName, email, role } = req.body as Partial<Record<string, unknown>>;
  const updates: Partial<{ displayName: string; email: string; role: 'user' | 'admin' }> = {};

  if (typeof displayName === 'string') updates.displayName = displayName;
  if (typeof email === 'string') updates.email = email;

  // Role change is only allowed for admins.
  if (role !== undefined) {
    // Load current user to check role.
    const currentUser = await User.findById(userId).select('role');
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin privilege required to change role' });
    }
    if (role === 'user' || role === 'admin') updates.role = role as any;
    else return res.status(400).json({ error: 'Invalid role value' });
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true })
      .select('-passwordHash');
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: updatedUser });
  } catch (err) {
    console.error('Update me error:', err);
    // Duplicate email error handling
    if ((err as any).code === 11000) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
