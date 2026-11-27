import { z } from 'zod';

export const createMandateSchema = z.object({
  agentId: z.string().uuid(),
  payerWallet: z.string().regex(/^0x[\da-fA-F]{40}$/),
  taskId: z.string().trim().min(1).max(100).optional(),
}).strict();

export const mandateIdSchema = z.string().uuid();

export const mandateListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export type CreateMandateInput = z.infer<typeof createMandateSchema>;
