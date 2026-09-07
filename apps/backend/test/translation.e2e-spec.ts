import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { TranslationModule } from "../src/modules/translation/translation.module";
import { GoogleTranslateService } from "../src/modules/translation/google-translate.service";
import { PrismaService } from "../src/database/prisma.service";
import { createMockPrisma } from "./test-helpers";

describe("TranslationController (e2e)", () => {
  let app: INestApplication;
  const mockPrisma = createMockPrisma();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TranslationModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(GoogleTranslateService)
      .useValue({
        isAvailable: () => true,
        translateText: jest.fn().mockResolvedValue("यह एक सुंदर झरना है"),
        batchTranslate: jest.fn().mockResolvedValue(["यह एक सुंदर झरना है"]),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("/translations/live (POST) - with Google Mock", async () => {
    const response = await request(app.getHttpServer())
      .post("/translations/live")
      .send({ text: "This is a beautiful waterfall", targetLang: "hi" })
      .expect(200);

    expect(response.body.translated).toBe("यह एक सुंदर झरना है");
  });

  it("/translations (POST) - with translation request", async () => {
    const response = await request(app.getHttpServer())
      .post("/translations")
      .send({ text: "waterfall", target: "cg" })
      .expect(200);

    expect(response.body.translatedText).toBe("झरना");
  });
});
