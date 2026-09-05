import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .default('development'),

  PORT: Joi.number()
    .port()
    .default(4000),

  DATABASE_URL: Joi.string()
    .uri({
      scheme: [
        'postgresql',
        'postgres',
        'sqlite',
        'file',
      ],
    })
    .required(),

  JWT_SECRET: Joi.string()
    .min(32)
    .required(),

  JWT_EXPIRES_IN: Joi.string()
    .default('15m'),

  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .default('7d'),

  GEMINI_API_KEY: Joi.string()
    .allow('')
    .default(''),

  GOOGLE_TRANSLATE_API_KEY: Joi.string()
    .allow('')
    .default(''),

  MAPBOX_API_KEY: Joi.string()
    .allow('')
    .default(''),

  OPENWEATHER_API_KEY: Joi.string()
    .allow('')
    .default(''),

  YOUTUBE_API_KEY: Joi.string()
    .allow('')
    .default(''),

  INSTAGRAM_APP_SECRET: Joi.string()
    .allow('')
    .default(''),

  INSTAGRAM_VERIFY_TOKEN: Joi.string()
    .allow('')
    .default(''),

  AWS_ACCESS_KEY_ID: Joi.string()
    .allow('')
    .default(''),

  AWS_SECRET_ACCESS_KEY: Joi.string()
    .allow('')
    .default(''),

  AWS_REGION: Joi.string()
    .allow('')
    .default(''),

  AWS_S3_BUCKET: Joi.string()
    .allow('')
    .default(''),

  CORS_ORIGINS: Joi.string()
    .default('http://localhost:3000'),

  LOG_LEVEL: Joi.string()
    .valid(
      'error',
      'warn',
      'info',
      'debug',
      'verbose',
    )
    .default('info'),
});
