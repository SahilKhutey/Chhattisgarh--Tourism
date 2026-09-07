process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/cgtourism_test?schema=public";
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test_super_secret_jwt_key_at_least_32_characters";
process.env.PORT = "4001";

import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";
import { createMockPrisma } from "./test-helpers";

describe("Application Health E2E", () => {
  let app: INestApplication;
  const mockPrisma = createMockPrisma();

  beforeAll(async () => {
    mockPrisma.emergencyStation.findMany.mockResolvedValue([]);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("application starts successfully", () => {
    expect(app).toBeDefined();
  });

  it("responds to helplines discovery endpoint without 5xx", async () => {
    const response = await request(app.getHttpServer()).get(
      "/api/v1/emergency/helplines",
    );
    expect(response.status).toBe(200);
  });

  it("responds with 404 for unknown endpoints", async () => {
    const response = await request(app.getHttpServer()).get(
      "/api/v1/non-existent-route-xyz",
    );
    expect(response.status).toBe(404);
  });
});
