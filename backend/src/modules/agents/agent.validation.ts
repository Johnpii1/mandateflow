import { z } from 'zod';

const slugPart = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createAgentSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(1).max(500),
  avatarUrl: z.url().max(2048).optional(),
  category: z.string().trim().min(2).max(50).regex(slugPart),
  capabilities: z.array(z.string().trim().min(2).max(50).regex(slugPart)).min(1).max(30),
  serviceDescription: z.string().trim().min(1).max(2000),
  pricing: z.object({
    model: z.enum(['fixed', 'hourly', 'per-task']),
    amount: z.string().regex(/^(?=.*[1-9])\d{1,24}(?:\.\d{1,18})?$/, 'Amount must be a positive exact decimal string'),
    token: z.string().regex(/^[a-zA-Z0-9]{2,12}$/),
    chainId: z.number().int().positive(),
  }).strict(),
  endpointUrl: z.url().max(2048).optional(),
}).strict();

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
