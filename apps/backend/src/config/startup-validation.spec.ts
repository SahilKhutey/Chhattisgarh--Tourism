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

  it('rejects known placeholder JWT secrets in production', () => {
    const environment = {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://prod_user:secret@db.cgtourism.internal:5432/cgtourism',
      JWT_SECRET: 'test_super_secret_jwt_key_at_least_32_characters',
      PORT: 4000,
    };

    const result = envSchema.validate(environment);

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('contains an invalid value');
  });

  it('accepts strong, unique JWT secrets in production', () => {
    const environment = {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://prod_user:secret@db.cgtourism.internal:5432/cgtourism',
      JWT_SECRET: 'k9#mP$vL8@qW2!zR5^tY1&uI4*oE7(bX0)',
      PORT: 4000,
    };

    const result = envSchema.validate(environment);

    expect(result.error).toBeUndefined();
  });

  it('validates REDIS_URL format', () => {
    const valid = envSchema.validate({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://user:password@localhost:5432/cg_tourism',
      JWT_SECRET: 'abcdefghijklmnopqrstuvwxyz123456',
      REDIS_URL: 'redis://redis:6379',
    });
    expect(valid.error).toBeUndefined();

    const invalid = envSchema.validate({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://user:password@localhost:5432/cg_tourism',
      JWT_SECRET: 'abcdefghijklmnopqrstuvwxyz123456',
      REDIS_URL: 'http://invalid-redis-protocol:6379',
    });
    expect(invalid.error).toBeDefined();
    expect(invalid.error?.message).toContain('REDIS_URL');
  });
});
