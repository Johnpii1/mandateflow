import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import {
  loginController,
  logoutController,
  meController,
  registerController,
} from './auth.controller.js';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/logout', authenticate, logoutController);
router.get('/me', authenticate, meController);

export default router;
