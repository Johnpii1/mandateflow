import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { updateMeController } from './user.controller.js';

const router = Router();

// PATCH /me – update profile of the authenticated user
router.patch('/me', authenticate, updateMeController);

export default router;
