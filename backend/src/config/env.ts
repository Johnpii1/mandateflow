import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(5000),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  HSP_COORDINATOR_URL: z.string().url().optional(),
  HSP_API_KEY: z.string().min(1).optional(),
}).superRefine((values, context) => {
  if (Boolean(values.HSP_COORDINATOR_URL) !== Boolean(values.HSP_API_KEY)) {
    context.addIssue({
      code: 'custom',
      path: ['HSP_COORDINATOR_URL'],
      message: 'HSP_COORDINATOR_URL and HSP_API_KEY must be configured together',
    });
  }
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map(({ path, message }) => `  - ${path.join('.')}: ${message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${details}`);
}

export const env = parsedEnv.data;
