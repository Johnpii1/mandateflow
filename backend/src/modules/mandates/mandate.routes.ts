import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import {
  createMandateController,
  getMandateController,
  listMandatesController,
} from './mandate.controller.js';

const router = Router();

router.post('/', authenticate, createMandateController);
router.get('/', authenticate, listMandatesController);
router.get('/:mandateId', authenticate, getMandateController);

export default router;
