import { Router } from 'express';
import {
  marketplaceCategoriesController,
  searchMarketplaceController,
} from './marketplace.controller.js';

const router = Router();

router.get('/agents', searchMarketplaceController);
router.get('/categories', marketplaceCategoriesController);

export default router;
