import { Router } from 'express';
import { User } from '../../modules/users/user.model.js';
import { Agent } from '../../modules/agents/agent.model.js';
import { authenticate } from '../../common/middleware/authenticate.js';
import { requireAdmin } from '../../common/middleware/requireAdmin.js';

/**
 * Admin routes for managing users and agents.
 */
const adminRouter = Router();

/**
 * GET /users - List all users (admin only).
 */
adminRouter.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('email displayName role');
    res.json(users);
  } catch (err) {
    console.error('Admin users fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /agents - List all agents (admin only). Supports optional pagination.
 */
adminRouter.get('/agents', authenticate, requireAdmin, async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  try {
    const [agents, total] = await Promise.all([
      Agent.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Agent.countDocuments(),
    ]);
    res.json({ agents, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('Admin agents fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /agents/:agentId/status - Admin can change an agent's status regardless of owner.
 * Body: { status: 'active' | 'suspended' | 'archived' }
 */
const allowedTransitions: Record<string, string[]> = {
  draft: ['active', 'archived'],
  active: ['suspended', 'archived'],
  suspended: ['active', 'archived'],
  archived: [],
};

adminRouter.patch('/agents/:agentId/status', authenticate, requireAdmin, async (req, res) => {
  const { agentId } = req.params;
  const { status: nextStatus } = req.body as { status?: string };
  if (!nextStatus) {
    return res.status(400).json({ error: 'Missing status in request body' });
  }
  if (!['active', 'suspended', 'archived'].includes(nextStatus)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }
  try {
    const existing = await Agent.findOne({ agentId });
    if (!existing) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    if (!allowedTransitions[existing.status]?.includes(nextStatus)) {
      return res.status(409).json({ error: `Cannot change agent status from ${existing.status} to ${nextStatus}` });
    }
    const updated = await Agent.findOneAndUpdate(
      { agentId, status: existing.status },
      { $set: { status: nextStatus as any, isDiscoverable: nextStatus === 'active' } },
      { new: true, runValidators: true },
    );
    if (!updated) {
      return res.status(409).json({ error: 'Agent status changed concurrently; reload and retry' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Admin agent status update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default adminRouter;

