import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const exists = (file) => fs.existsSync(path.join(root, file));
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("PostGIS Docker initialization script exists", () => {
  assert.equal(exists("docker/postgres/init/001-extensions.sql"), true);
  const content = read("docker/postgres/init/001-extensions.sql");
  assert.match(content, /CREATE EXTENSION IF NOT EXISTS postgis;/);
  assert.match(content, /CREATE EXTENSION IF NOT EXISTS pgcrypto;/);
});

test("docker-compose.yml mounts PostGIS initialization script", () => {
  assert.equal(exists("docker-compose.yml"), true);
  const content = read("docker-compose.yml");
  assert.match(content, /docker-entrypoint-initdb\.d/);
  assert.match(content, /postgis\/postgis/);
});

test("docker-compose.prod.yml mounts PostGIS initialization script", () => {
  assert.equal(exists("docker-compose.prod.yml"), true);
  const content = read("docker-compose.prod.yml");
  assert.match(content, /docker-entrypoint-initdb\.d/);
  assert.match(content, /postgis\/postgis/);
});

test("Prisma schema uses postgresql provider", () => {
  assert.equal(exists("apps/backend/prisma/schema.prisma"), true);
  const content = read("apps/backend/prisma/schema.prisma");
  assert.match(content, /provider\s*=\s*"postgresql"/);
  assert.doesNotMatch(content, /provider\s*=\s*"sqlite"/);
});

test("PostgreSQL baseline migration exists and has no SQLite pragmas", () => {
  const migrationPath = "apps/backend/prisma/migrations/0_init_postgresql/migration.sql";
  assert.equal(exists(migrationPath), true);
  const content = read(migrationPath);
  assert.match(content, /CREATE TABLE "Place"/);
  assert.match(content, /CREATE TABLE "User"/);
  assert.doesNotMatch(content, /PRAGMA/i);
  assert.doesNotMatch(content, /AUTOINCREMENT/i);
});

test("SQLite migrations are backed up", () => {
  assert.equal(exists("apps/backend/prisma/migrations.sqlite.backup"), true);
});

test("Database verification script exists", () => {
  assert.equal(exists("scripts/db/verify.ts"), true);
});

test("Database documentation exists", () => {
  assert.equal(exists("docs/development/database.md"), true);
});
