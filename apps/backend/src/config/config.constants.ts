export const CONFIG_KEYS = {
  APP_PORT: 'app.port',
  APP_ENVIRONMENT: 'app.environment',

  DATABASE_URL: 'database.url',

  JWT_SECRET: 'auth.jwtSecret',
  JWT_EXPIRES_IN: 'auth.jwtExpiresIn',
  JWT_REFRESH_EXPIRES_IN: 'auth.jwtRefreshExpiresIn',

  GEMINI_API_KEY: 'ai.geminiApiKey',
  GOOGLE_TRANSLATE_API_KEY: 'translation.googleApiKey',
  MAPBOX_API_KEY: 'maps.mapboxApiKey',
  OPENWEATHER_API_KEY: 'weather.openWeatherApiKey',
  YOUTUBE_API_KEY: 'social.youtubeApiKey',
  INSTAGRAM_APP_SECRET: 'social.instagramAppSecret',
  INSTAGRAM_VERIFY_TOKEN: 'social.instagramVerifyToken',

  AWS_ACCESS_KEY_ID: 'storage.awsAccessKeyId',
  AWS_SECRET_ACCESS_KEY: 'storage.awsSecretAccessKey',
  AWS_REGION: 'storage.awsRegion',
  AWS_S3_BUCKET: 'storage.bucket',

  CORS_ORIGINS: 'cors.origins',
  LOG_LEVEL: 'logging.level',
} as const;
