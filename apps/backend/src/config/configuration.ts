export default () => ({
  app: {
    environment: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 4000),
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    jwtRefreshExpiresIn:
      process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY,
  },

  translation: {
    googleApiKey:
      process.env.GOOGLE_TRANSLATE_API_KEY,
  },

  maps: {
    mapboxApiKey:
      process.env.MAPBOX_API_KEY,
  },

  weather: {
    openWeatherApiKey:
      process.env.OPENWEATHER_API_KEY,
  },

  social: {
    youtubeApiKey:
      process.env.YOUTUBE_API_KEY,

    instagramAppSecret:
      process.env.INSTAGRAM_APP_SECRET,

    instagramVerifyToken:
      process.env.INSTAGRAM_VERIFY_TOKEN,
  },

  storage: {
    awsAccessKeyId:
      process.env.AWS_ACCESS_KEY_ID,

    awsSecretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY,

    awsRegion:
      process.env.AWS_REGION,

    bucket:
      process.env.AWS_S3_BUCKET,
  },

  cors: {
    origins:
      process.env.CORS_ORIGINS
        ?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean) ?? [],
  },

  logging: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
});
