import { Test, TestingModule } from '@nestjs/testing';
import { TranslationController } from './translation.controller';
import { TranslationService } from './translation.service';
import { BadRequestException } from '@nestjs/common';

describe('TranslationController', () => {
  let controller: TranslationController;
  let service: TranslationService;

  const mockTranslationService = {
    translate: jest.fn().mockResolvedValue({
      text: 'waterfall',
      source: 'en',
      target: 'cg',
      translatedText: 'झरना',
      provider: 'glossary',
      cached: false,
    }),
    getTranslations: jest.fn().mockResolvedValue({}),
    upsertTranslation: jest.fn().mockResolvedValue({ id: '1' }),
    translateLive: jest.fn().mockResolvedValue({ translated: 'झरना', cached: false, provider: 'google' }),
    batchTranslateLive: jest.fn().mockResolvedValue({ translations: ['झरना'], provider: 'google' }),
    validateTranslation: jest.fn().mockReturnValue({ isValid: true, suggestions: [] }),
    getGlossary: jest.fn().mockReturnValue({ waterfall: { hi: 'जलप्रपात', cg: 'झरना' } }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TranslationController],
      providers: [
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    }).compile();

    controller = module.get<TranslationController>(TranslationController);
    service = module.get<TranslationService>(TranslationService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handlePost (POST /api/v1/translation)', () => {
    it('should delegate translation requests to translationService.translate', async () => {
      const dto = { text: 'waterfall', source: 'en', target: 'cg' };
      const res = await controller.handlePost(dto);

      expect(service.translate).toHaveBeenCalledWith('waterfall', 'en', 'cg');
      expect(res).toEqual({
        text: 'waterfall',
        source: 'en',
        target: 'cg',
        translatedText: 'झरना',
        provider: 'glossary',
        cached: false,
      });
    });

    it('should delegate upsert requests to translationService.upsertTranslation', async () => {
      const upsertDto = {
        lang: 'hi',
        entityType: 'Place',
        entityId: 'place-123',
        field: 'name',
        value: 'चित्रकोट',
      };
      const res = await controller.handlePost(upsertDto);

      expect(service.upsertTranslation).toHaveBeenCalledWith(
        'hi',
        'Place',
        'place-123',
        'name',
        'चित्रकोट',
      );
      expect(res).toEqual({ id: '1' });
    });

    it('should throw BadRequestException if payload matches neither translation nor upsert', async () => {
      await expect(controller.handlePost({})).rejects.toThrow(BadRequestException);
    });
  });

  describe('getGlossary (GET /translations/glossary)', () => {
    it('should return regional glossary records', () => {
      const glossary = controller.getGlossary();
      expect(glossary).toBeDefined();
      expect(glossary.waterfall).toBeDefined();
    });
  });
});
