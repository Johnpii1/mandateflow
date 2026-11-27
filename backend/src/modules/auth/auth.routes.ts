import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import {
  loginController,
  logoutController,
  meController,
  registerController,
  walletNonceController,
  walletVerifyController,
} from './auth.controller.js';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/logout', authenticate, logoutController);
router.get('/me', authenticate, meController);
router.post('/wallet/nonce', authenticate, walletNonceController);
router.post('/wallet/verify', authenticate, walletVerifyController);

export default router;
