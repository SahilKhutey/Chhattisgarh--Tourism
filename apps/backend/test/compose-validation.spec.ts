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

  describe('Operational Production Scripts (scripts/)', () => {
    const backupScript = path.join(rootDir, 'scripts/backup-db.sh');
    const restoreScript = path.join(rootDir, 'scripts/restore-db.sh');
    const verifyScript = path.join(rootDir, 'scripts/verify-production.sh');
    const deployScript = path.join(rootDir, 'scripts/deploy-production.sh');

    it('ensures all 4 operational scripts exist with bash shebang and pipefail', () => {
      for (const scriptPath of [backupScript, restoreScript, verifyScript, deployScript]) {
        expect(fs.existsSync(scriptPath)).toBe(true);
        const content = fs.readFileSync(scriptPath, 'utf8');
        expect(content).toMatch(/^#!/);
        expect(content).toContain('set -euo pipefail');
      }
    });

    it('validates backup-db.sh configuration and compression format', () => {
      const content = fs.readFileSync(backupScript, 'utf8');
      expect(content).toContain('pg_dump');
      expect(content).toContain('-F c');
      expect(content).toContain('RETENTION_DAYS');
    });

    it('validates restore-db.sh safety and confirmation requirements', () => {
      const content = fs.readFileSync(restoreScript, 'utf8');
      expect(content).toContain('pg_restore');
      expect(content).toContain('--confirm');
      expect(content).toMatch(/DESTRUCTIVE/i);
    });

    it('validates verify-production.sh probe coverage', () => {
      const content = fs.readFileSync(verifyScript, 'utf8');
      expect(content).toContain('/api/v1/health/live');
      expect(content).toContain('/api/v1/health/ready');
      expect(content).toContain('/api/v1/health');
    });

    it('validates deploy-production.sh end-to-end orchestration sequence', () => {
      const content = fs.readFileSync(deployScript, 'utf8');
      expect(content).toContain('.env.production');
      expect(content).toContain('docker compose');
      expect(content).toContain('prisma migrate deploy');
      expect(content).toContain('verify-production.sh');
    });
  });
});

