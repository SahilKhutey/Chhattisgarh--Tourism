import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(3000),

  DATABASE_URL: z.string().min(1),

  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),

  CORS_ORIGIN: z.string().min(1).default('http://localhost:3000'),
});

export type AppEnv = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): AppEnv {
  return envSchema.parse(config);
}
