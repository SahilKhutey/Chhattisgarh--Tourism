import fs from 'node:fs';
import process from 'node:process';

const requiredTemplateFiles = [
  '.env.example',
  '.env.local.example',
  '.env.staging.example',
  '.env.production.example',
];

const requiredVariables = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'GEMINI_API_KEY',
  'GOOGLE_TRANSLATE_API_KEY',
  'MAPBOX_API_KEY',
  'OPENWEATHER_API_KEY',
  'YOUTUBE_API_KEY',
  'INSTAGRAM_APP_SECRET',
  'INSTAGRAM_VERIFY_TOKEN',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_S3_BUCKET',
  'CORS_ORIGINS',
  'LOG_LEVEL',
];

let failed = false;

for (const file of requiredTemplateFiles) {
  if (!fs.existsSync(file)) {
    console.error(`Missing: ${file}`);
    failed = true;
  } else {
    console.log(`OK: ${file}`);
  }
}

const envExample = fs.existsSync('.env.example')
  ? fs.readFileSync('.env.example', 'utf8')
  : '';

for (const variable of requiredVariables) {
  const pattern = new RegExp(`^${variable}=`, 'm');

  if (!pattern.test(envExample)) {
    console.error(
      `Missing variable in .env.example: ${variable}`,
    );

    failed = true;
  } else {
    console.log(
      `OK: ${variable}`,
    );
  }
}

if (failed) {
  console.error(
    '\nConfiguration verification failed.',
  );

  process.exit(1);
}

console.log(
  '\nConfiguration verification passed.',
);
