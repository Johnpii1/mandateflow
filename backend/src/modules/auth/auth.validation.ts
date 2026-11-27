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

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
