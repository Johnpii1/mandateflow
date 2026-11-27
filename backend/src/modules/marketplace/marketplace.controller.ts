import type { RequestHandler } from 'express';
import { listMarketplaceCategories, searchMarketplace } from './marketplace.service.js';
import { marketplaceQuerySchema } from './marketplace.validation.js';

export const searchMarketplaceController: RequestHandler = async (request, response) => {
  const parsed = marketplaceQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    response.status(400).json({ error: 'Invalid query', details: parsed.error.issues });
    return;
  }

  response.json(await searchMarketplace(parsed.data));
};

export const marketplaceCategoriesController: RequestHandler = async (_request, response) => {
  response.json({ categories: await listMarketplaceCategories() });
};
