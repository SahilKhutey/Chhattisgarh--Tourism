# CG Tourism OS — Configuration & Environment Guide

This document defines the official configuration specification, required secrets, environment lifecycle templates, and security rules for **CG Tourism OS (`Unseen36Garh`)**.

---

## 1. Architectural Principle

> **No application module should independently interpret environment variables.**
>
> All configuration must flow through:
> ```
> process.env  ──►  Joi Schema Validation  ──►  Typed Configuration Factory  ──►  ConfigService
> ```

---

## 2. Configuration Inventory

| Variable | Required | Default | Used By | Security Classification | Description |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `NODE_ENV` | Yes | `development` | NestJS / Next.js | Public | Runtime environment (`development`, `test`, `staging`, `production`). |
| `PORT` | Yes | `4000` | NestJS Core Gateway | Public | HTTP port for backend API kernel. |
| `DATABASE_URL` | Yes | — | Prisma ORM | **Confidential** | PostgreSQL / PostGIS connection URI (`postgresql://...`). |
| `JWT_SECRET` | Yes | — | AuthModule / JwtStrategy | **Critical Secret** | Secret key for signing access tokens (min. 32 characters). |
| `JWT_EXPIRES_IN` | No | `15m` | AuthModule | Public | Expiration duration for access tokens. |
| `JWT_REFRESH_EXPIRES_IN`| No | `7d` | AuthService | Public | Expiration duration for refresh tokens. |
| `GEMINI_API_KEY` | Optional | `""` | AI Image / Itinerary | **Secret** | Google Gemini API key for autonomous travel curation. |
| `GOOGLE_TRANSLATE_API_KEY`| Optional | `""` | TranslationModule | **Secret** | Google Cloud Translate API key for live multilingual fallback. |
| `MAPBOX_API_KEY` | Optional | `""` | TransportModule | **Secret** | Mapbox Directions and distance calculation API key. |
| `OPENWEATHER_API_KEY` | Optional | `""` | WeatherModule | **Secret** | OpenWeather API key for live temperature and monsoon alerts. |
| `YOUTUBE_API_KEY` | Optional | `""` | AggregationModule | **Secret** | YouTube Data API v3 key for creator video synchronization. |
| `INSTAGRAM_APP_SECRET` | Optional | `""` | AggregationModule | **Secret** | Instagram Graph API App Secret for webhook HMAC verification. |
| `INSTAGRAM_VERIFY_TOKEN` | Optional | `""` | AggregationModule | **Secret** | Instagram webhook verification token. |
| `AWS_ACCESS_KEY_ID` | Optional | `""` | StorageModule | **Confidential** | S3-compatible cloud object storage key. |
| `AWS_SECRET_ACCESS_KEY` | Optional | `""` | StorageModule | **Critical Secret** | S3-compatible cloud object storage secret. |
| `AWS_REGION` | Optional | `""` | StorageModule | Public | AWS / S3 target storage region (e.g. `ap-south-1`). |
| `AWS_S3_BUCKET` | Optional | `""` | StorageModule | Public | S3 bucket name for tourism media storage. |
| `CORS_ORIGINS` | No | `http://localhost:3000` | NestJS Gateway | Public | Comma-separated list of allowed client origins. |
| `LOG_LEVEL` | No | `info` | Logging Subsystem | Public | Log severity threshold (`error`, `warn`, `info`, `debug`, `verbose`). |

---

## 3. Environment Templates

The repository provides 4 standardized templates:
1. **`.env.example`**: Exhaustive template with all documented variables and placeholder comments.
2. **`.env.local.example`**: Minimal pre-configured values for local workstation development.
3. **`.env.staging.example`**: Staging deployment template with sanitized service endpoints.
4. **`.env.production.example`**: Hardened production template requiring high-entropy secrets and strict domain bindings.

---

## 4. Verification Commands

```bash
# Verify environment templates and variable completeness
pnpm config:check

# Run configuration unit and negative startup tests
pnpm test:config
```
