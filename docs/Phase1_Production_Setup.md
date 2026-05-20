# CG Tourism Platform — Phase 1: Production Setup Documentation
## Monorepo Setups, Docker Containers, NestJS Entrypoints & Workspace Configurations

---

## 1. Development Phase Goal
This setup outlines the engineering baseline required to configure a production-ready monorepo using **Turborepo, Next.js, Expo, NestJS, and Prisma** for the **Chhattisgarh Tourism Digital Ecosystem**.

---

## 2. Production Monorepo Layout

We structure our workspace files using the directory tree below:

```
cg-tourism-platform/
├── apps/
│   ├── mobile/          # Expo & React Native smartphone client
│   ├── web/             # Next.js customer exploration portal
│   └── backend/         # NestJS modular monolith microservice core
├── packages/
│   ├── ui/              # Shared component designs (Buttons, Cards, Modals)
│   ├── config/          # TypeScript & Tailwind central presets
│   └── design-system/   # Nature HSL styling variables & tokens
├── docs/                # Persistent system architecture manuals
├── docker-compose.yml   # Multi-container local persistent databases
├── turbo.json           # Turborepo caching pipelines
└── package.json         # Workspace control scripts
```

---

## 3. Workspace Engine Configs

### A. Root Monorepo `package.json`
```json
{
  "name": "cg-tourism-platform",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "format": "prettier --write \"**/*.{ts,tsx,js,json,md}\""
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0",
    "prettier": "^3.2.0"
  }
}
```

### B. Turborepo Configuration Pipeline (`turbo.json`)
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "outputs": []
    }
  }
}
```

---

## 4. Multi-Container Infrastructure (`docker-compose.yml`)

For local sandbox validation of databases and caching layers, spin up containers using this database-ready orchestrator configuration:

```yaml
version: '3.8'

services:
  # 1. PostGIS Enabled PostgreSQL Cluster
  postgres:
    image: postgis/postgis:16-3.4
    container_name: cgtourism_postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure_postgres_password
      POSTGRES_DB: cgtourism
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d cgtourism"]
      interval: 8s
      timeout: 5s
      retries: 5

  # 2. Redis Caching & Queue Broker
  redis:
    image: redis:7-alpine
    container_name: cgtourism_redis
    restart: always
    ports:
      - '6379:6379'
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 8s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
    driver: local
  redisdata:
    driver: local
```

---

## 5. NestJS Production Entrypoint (`apps/backend/src/main.ts`)

```typescript
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  // Initialize modular monolith app context
  const app = await NestFactory.create(AppModule);

  // 1. Secure HTTP Headers using Helmet middleware
  app.use(helmet());

  // 2. High-performance response compression Gzip
  app.use(compression());

  // 3. Configure CORS policies for secure monorepo client fetches
  app.enableCors({
    origin: process.env.CORS_ALLOWED_ORIGINS 
      ? process.env.CORS_ALLOWED_ORIGINS.split(',') 
      : '*',
    credentials: true,
  });

  // 4. Prefix all routing paths to comply with Version 1 architectures
  app.setGlobalPrefix('api/v1');

  // 5. Apply strict input validations to filter payload parameters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 6. Bootstrap Swagger API Document system
  const config = new DocumentBuilder()
    .setTitle('CG Tourism API Platform')
    .setDescription('Regional Digital Tourism Infrastructure APIs for Chhattisgarh')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 7. Bind NestJS to default back-end server port
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Backend Server successfully active on port: ${port}`);
}

bootstrap();
```

---

## 6. Monorepo Git Security Ignore (`.gitignore`)
```
# Dependency folders
node_modules/
.pnpm-store/

# Build caches & outputs
dist/
build/
.next/
.turbo/
out/

# Environment files containing local secrets
.env
.env.local
.env.*.local

# IDE local configuration files
.vscode/
.idea/
*.suo
*.ntvs*

---

## 7. Production-Grade Docker Containerization & Deployment

To deploy the entire Chhattisgarh Tourism platform stack in a highly available, fully containerized production environment, we utilize optimized multi-stage Docker builds coupled with Docker Compose.

### A. Core backend Service (`apps/backend/Dockerfile`)
This Dockerfile builds the NestJS API monolith inside the monorepo workspace context:
- Copies dependency manifests, locks down with `--frozen-lockfile`, and generates the Prisma Client.
- Compiles TS sources down to optimal Javascript using the Next-gen Node runtime.
- Employs a multi-stage `runner` image containing only essential runtimes to minimize the attack surface.

### B. Web Client Gateway (`apps/web/Dockerfile`)
Built on Next.js, the web container is fully optimized for speed and production serving:
- Configures default environment variables at compilation time.
- Mounts and packs pages to optimized static files and dynamic modules.

### C. Multi-Container Orchestration (`docker-compose.prod.yml`)
The orchestration configuration mounts all 4 core layers in a secure bridge network:
- **`postgres`**: Relational store pre-loaded with PostGIS spatial engines.
- **`redis`**: Caching and priority queue runner.
- **`backend`**: Port `4000` service dependent on healthy db & queue.
- **`web`**: Port `3000` app server serving pages.

To boot the full production stack:
```bash
docker compose -f docker-compose.prod.yml up --build -d
```
