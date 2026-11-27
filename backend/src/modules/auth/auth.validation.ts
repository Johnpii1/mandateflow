import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(10).max(128),
  displayName: z.string().trim().min(1).max(80),
}).strict();

export const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(128),
}).strict();

const walletAddressSchema = z.string().regex(/^0x[\da-fA-F]{40}$/, 'Invalid EVM address');

export const walletNonceSchema = z.object({
  address: walletAddressSchema,
  chainId: z.number().int().positive(),
}).strict();

export const walletVerifySchema = z.object({
  nonce: z.string().regex(/^[\da-f]{32}$/),
  signature: z.string().regex(/^0x[\da-fA-F]{130}$/, 'Expected a 65-byte EVM signature'),
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
