import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TranslationModule } from '../src/modules/translation/translation.module';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.post('https://translation.googleapis.com/language/translate/v2', () => {
    return HttpResponse.json({
      data: {
        translations: [
          { translatedText: 'यह एक सुंदर झरना है' }
        ]
      }
    });
  })
);

describe('TranslationController (e2e)', () => {
  let app: INestApplication;

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TranslationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/translations/live (POST) - with Google Mock', () => {
    return request(app.getHttpServer())
      .post('/translations/live')
      .send({ text: 'This is a beautiful waterfall', targetLang: 'hi' })
      .expect(201)
      .expect((res) => {
        expect(res.body.translatedText).toBe('यह एक सुंदर झरना है');
      });
  });
});
