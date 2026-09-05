import { envSchema } from './env.schema';

describe('Startup configuration validation', () => {
  it('fails when JWT_SECRET is missing', () => {
    const environment = {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://user:password@localhost:5432/cg_tourism',
      PORT: 4000,
    };

    const result = envSchema.validate(environment);

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('JWT_SECRET');
  });

  it('fails when DATABASE_URL is missing', () => {
    const environment = {
      NODE_ENV: 'test',
      JWT_SECRET: 'abcdefghijklmnopqrstuvwxyz123456',
      PORT: 4000,
    };

    const result = envSchema.validate(environment);

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('DATABASE_URL');
  });
});
