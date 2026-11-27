import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { createAgentController } from './agent.controller.js';

const router = Router();

router.post('/', authenticate, createAgentController);

export default router;
