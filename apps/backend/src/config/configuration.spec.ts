import configuration from './configuration';

describe('configuration()', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('maps application configuration', () => {
    process.env.NODE_ENV = 'test';
    process.env.PORT = '4000';

    const config = configuration();

    expect(config.app.environment).toBe('test');
    expect(config.app.port).toBe(4000);
  });

  it('maps JWT configuration', () => {
    process.env.JWT_SECRET = 'abcdefghijklmnopqrstuvwxyz123456';
    process.env.JWT_EXPIRES_IN = '15m';

    const config = configuration();

    expect(config.auth.jwtSecret).toBe('abcdefghijklmnopqrstuvwxyz123456');
    expect(config.auth.jwtExpiresIn).toBe('15m');
  });

  it('maps CORS origins', () => {
    process.env.CORS_ORIGINS = 'http://localhost:3000,http://localhost:4000';

    const config = configuration();

    expect(config.cors.origins).toEqual([
      'http://localhost:3000',
      'http://localhost:4000',
    ]);
  });
});
