import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import {
  changeAgentStatusController,
  createAgentController,
  getDiscoverableAgentController,
  listOwnedAgentsController,
  updateAgentController,
} from './agent.controller.js';

const router = Router();

router.post('/', authenticate, createAgentController);
router.get('/:agentId', getDiscoverableAgentController);
router.patch('/:agentId', authenticate, updateAgentController);
router.patch('/:agentId/status', authenticate, changeAgentStatusController);

export const ownedAgentsRouter = Router();
ownedAgentsRouter.get('/', authenticate, listOwnedAgentsController);

export default router;
