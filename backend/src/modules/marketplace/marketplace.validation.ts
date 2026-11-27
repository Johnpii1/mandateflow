import { z } from 'zod';

const priceSchema = z.string().regex(/^\d{1,24}(?:\.\d{1,18})?$/);

function compareDecimalStrings(left: string, right: string): number {
  const [leftWhole = '0', leftFraction = ''] = left.split('.');
  const [rightWhole = '0', rightFraction = ''] = right.split('.');
  const normalizedLeftWhole = leftWhole.replace(/^0+(?=\d)/, '');
  const normalizedRightWhole = rightWhole.replace(/^0+(?=\d)/, '');

  if (normalizedLeftWhole.length !== normalizedRightWhole.length) {
    return normalizedLeftWhole.length < normalizedRightWhole.length ? -1 : 1;
  }
  if (normalizedLeftWhole !== normalizedRightWhole) {
    return normalizedLeftWhole < normalizedRightWhole ? -1 : 1;
  }

  const fractionLength = Math.max(leftFraction.length, rightFraction.length);
  const normalizedLeftFraction = leftFraction.padEnd(fractionLength, '0');
  const normalizedRightFraction = rightFraction.padEnd(fractionLength, '0');
  if (normalizedLeftFraction === normalizedRightFraction) return 0;
  return normalizedLeftFraction < normalizedRightFraction ? -1 : 1;
}

export const marketplaceQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  category: z.string().trim().min(2).max(50).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  capability: z.string().trim().min(2).max(50).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  chainId: z.coerce.number().int().positive().optional(),
  token: z.string().regex(/^[a-zA-Z0-9]{2,12}$/).optional(),
  priceMin: priceSchema.optional(),
  priceMax: priceSchema.optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict().superRefine((query, context) => {
  const priceRequested = query.priceMin !== undefined
    || query.priceMax !== undefined
    || query.sort !== 'newest';

  if (priceRequested && (!query.token || !query.chainId)) {
    context.addIssue({
      code: 'custom',
      path: ['token'],
      message: 'Price filters and sorting require both token and chainId',
    });
  }

  if (query.priceMin && query.priceMax && compareDecimalStrings(query.priceMin, query.priceMax) > 0) {
    context.addIssue({
      code: 'custom',
      path: ['priceMin'],
      message: 'priceMin cannot exceed priceMax',
    });
  }
});

export type MarketplaceQuery = z.infer<typeof marketplaceQuerySchema>;
