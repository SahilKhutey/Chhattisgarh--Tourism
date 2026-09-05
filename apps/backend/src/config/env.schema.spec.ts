import { envSchema } from './env.schema';

describe('Environment configuration', () => {
  const validEnvironment = {
    NODE_ENV: 'test',
    PORT: 4000,
    DATABASE_URL: 'postgresql://user:password@localhost:5432/cg_tourism',
    JWT_SECRET: 'abcdefghijklmnopqrstuvwxyz123456',
    JWT_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
    GEMINI_API_KEY: '',
    GOOGLE_TRANSLATE_API_KEY: '',
    MAPBOX_API_KEY: '',
    OPENWEATHER_API_KEY: '',
    YOUTUBE_API_KEY: '',
    INSTAGRAM_APP_SECRET: '',
    INSTAGRAM_VERIFY_TOKEN: '',
    AWS_ACCESS_KEY_ID: '',
    AWS_SECRET_ACCESS_KEY: '',
    AWS_REGION: '',
    AWS_S3_BUCKET: '',
    CORS_ORIGINS: 'http://localhost:3000',
    LOG_LEVEL: 'info',
  };

  it('accepts a valid environment', () => {
    const result = envSchema.validate(validEnvironment);
    expect(result.error).toBeUndefined();
  });

  it('rejects a missing database URL', () => {
    const environment: any = { ...validEnvironment };
    delete environment.DATABASE_URL;
    const result = envSchema.validate(environment);
    expect(result.error).toBeDefined();
  });

  it('rejects a missing JWT secret', () => {
    const environment: any = { ...validEnvironment };
    delete environment.JWT_SECRET;
    const result = envSchema.validate(environment);
    expect(result.error).toBeDefined();
  });

  it('rejects a short JWT secret', () => {
    const environment = {
      ...validEnvironment,
      JWT_SECRET: 'short',
    };
    const result = envSchema.validate(environment);
    expect(result.error).toBeDefined();
  });

  it('rejects an invalid port', () => {
    const environment = {
      ...validEnvironment,
      PORT: 99999,
    };
    const result = envSchema.validate(environment);
    expect(result.error).toBeDefined();
  });

  it('rejects an unsupported environment', () => {
    const environment = {
      ...validEnvironment,
      NODE_ENV: 'something-invalid',
    };
    const result = envSchema.validate(environment);
    expect(result.error).toBeDefined();
  });

  it('accepts optional third-party API keys as empty values', () => {
    const result = envSchema.validate({
      ...validEnvironment,
      GEMINI_API_KEY: '',
      MAPBOX_API_KEY: '',
    });
    expect(result.error).toBeUndefined();
  });
});
