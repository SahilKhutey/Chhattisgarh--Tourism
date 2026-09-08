import * as fs from 'fs';
import * as path from 'path';

describe('Production Deployment & Container Configuration Validation', () => {
  const rootDir = path.resolve(__dirname, '../../..');
  const composePath = path.join(rootDir, 'docker-compose.prod.yml');
  const backendDockerfilePath = path.join(rootDir, 'apps/backend/Dockerfile');
  const webDockerfilePath = path.join(rootDir, 'apps/web/Dockerfile');
  const nextConfigPath = path.join(rootDir, 'apps/web/next.config.ts');
  const prodEnvSamplePath = path.join(rootDir, '.env.production.sample');

  describe('docker-compose.prod.yml', () => {
    let composeContent: string;

    beforeAll(() => {
      expect(fs.existsSync(composePath)).toBe(true);
      composeContent = fs.readFileSync(composePath, 'utf8');
    });

    it('defines all 4 essential production services', () => {
      expect(composeContent).toMatch(/postgres:\s*\n/);
      expect(composeContent).toMatch(/redis:\s*\n/);
      expect(composeContent).toMatch(/backend:\s*\n/);
      expect(composeContent).toMatch(/web:\s*\n/);
    });

    it('declares healthchecks on all 4 services', () => {
      // Postgres healthcheck
      expect(composeContent).toContain('pg_isready');
      // Redis healthcheck
      expect(composeContent).toContain('redis-cli');
      // Backend healthcheck probe
      expect(composeContent).toContain('/api/v1/health');
      // Web healthcheck probe
      expect(composeContent).toContain('http://localhost:3000/');
    });

    it('enforces service_healthy dependency ordering', () => {
      // Backend depends on healthy postgres and redis
      expect(composeContent).toMatch(
        /backend:[\s\S]*?depends_on:[\s\S]*?postgres:[\s\S]*?condition:\s*service_healthy/,
      );
      expect(composeContent).toMatch(
        /backend:[\s\S]*?depends_on:[\s\S]*?redis:[\s\S]*?condition:\s*service_healthy/,
      );
      // Web depends on healthy backend
      expect(composeContent).toMatch(
        /web:[\s\S]*?depends_on:[\s\S]*?backend:[\s\S]*?condition:\s*service_healthy/,
      );
    });

    it('configures isolated network and persistent volume declarations', () => {
      expect(composeContent).toContain('cg-network:');
      expect(composeContent).toContain('pgdata_prod:');
      expect(composeContent).toContain('redisdata_prod:');
    });

    it('bounds Redis memory in production command', () => {
      expect(composeContent).toContain('--maxmemory 256mb');
      expect(composeContent).toContain('--maxmemory-policy allkeys-lru');
    });
  });

  describe('apps/backend/Dockerfile', () => {
    let dockerfileContent: string;

    beforeAll(() => {
      expect(fs.existsSync(backendDockerfilePath)).toBe(true);
      dockerfileContent = fs.readFileSync(backendDockerfilePath, 'utf8');
    });

    it('uses multi-stage build pattern', () => {
      expect(dockerfileContent).toContain('FROM node:20-alpine AS base');
      expect(dockerfileContent).toContain('FROM base AS builder');
      expect(dockerfileContent).toContain('FROM base AS runner');
    });

    it('runs as unprivileged user node', () => {
      expect(dockerfileContent).toMatch(/USER node/);
      expect(dockerfileContent).toContain('chown -R node:node /app');
    });

    it('declares container healthcheck', () => {
      expect(dockerfileContent).toContain('HEALTHCHECK');
      expect(dockerfileContent).toContain('/api/v1/health');
    });

    it('runs node dist/main', () => {
      expect(dockerfileContent).toContain('CMD ["node", "dist/main"]');
    });
  });

  describe('apps/web/Dockerfile & Next.js Standalone', () => {
    let webDockerfileContent: string;
    let nextConfigContent: string;

    beforeAll(() => {
      expect(fs.existsSync(webDockerfilePath)).toBe(true);
      webDockerfileContent = fs.readFileSync(webDockerfilePath, 'utf8');

      expect(fs.existsSync(nextConfigPath)).toBe(true);
      nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
    });

    it('configures output: "standalone" in NextConfig', () => {
      expect(nextConfigContent).toMatch(/output:\s*["']standalone["']/);
    });

    it('copies standalone traces without redundant pnpm install in runner', () => {
      expect(webDockerfileContent).toContain('.next/standalone');
      expect(webDockerfileContent).toContain('.next/static');
      expect(webDockerfileContent).not.toMatch(/runner[\s\S]*?pnpm install/);
    });

    it('runs web container as unprivileged user node', () => {
      expect(webDockerfileContent).toMatch(/USER node/);
    });

    it('starts server via standalone server.js', () => {
      expect(webDockerfileContent).toContain('CMD ["node", "apps/web/server.js"]');
    });
  });

  describe('.env.production.sample', () => {
    it('exists and documents required secrets and connection parameters', () => {
      expect(fs.existsSync(prodEnvSamplePath)).toBe(true);
      const content = fs.readFileSync(prodEnvSamplePath, 'utf8');
      expect(content).toContain('DATABASE_URL');
      expect(content).toContain('REDIS_URL');
      expect(content).toContain('JWT_SECRET');
      expect(content).toContain('CORS_ORIGINS');
      expect(content).toContain('NEXT_PUBLIC_API_URL');
    });
  });
});
