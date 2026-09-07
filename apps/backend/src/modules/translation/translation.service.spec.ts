import { Test, TestingModule } from '@nestjs/testing';
import { TranslationService } from './translation.service';
import { PrismaService } from '../../database/prisma.service';
import { GoogleTranslateService } from './google-translate.service';
import { GlossaryService } from './glossary.service';

describe('TranslationService', () => {
  let service: TranslationService;
  let glossaryService: GlossaryService;
  let googleTranslateService: GoogleTranslateService;

  const mockPrismaService = {
    translation: {
      findMany: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockResolvedValue({}),
    },
    place: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    translationCache: {
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockResolvedValue({}),
    },
  };

  const mockGoogleTranslateService = {
    isAvailable: jest.fn().mockReturnValue(false),
    translateText: jest.fn().mockImplementation((text: string) => Promise.resolve(text)),
    batchTranslate: jest.fn().mockImplementation((texts: string[]) => Promise.resolve(texts)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranslationService,
        GlossaryService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: GoogleTranslateService, useValue: mockGoogleTranslateService },
      ],
    }).compile();

    service = module.get<TranslationService>(TranslationService);
    glossaryService = module.get<GlossaryService>(GlossaryService);
    googleTranslateService = module.get<GoogleTranslateService>(GoogleTranslateService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('translate pipeline', () => {
    it('should return passthrough when text is empty or whitespace', async () => {
      const res = await service.translate('   ', 'en', 'hi');
      expect(res.translatedText).toBe('   ');
      expect(res.provider).toBe('passthrough');
      expect(res.cached).toBe(false);
    });

    it('should return passthrough when source and target languages match', async () => {
      const res = await service.translate('Chitrakote', 'en', 'en');
      expect(res.translatedText).toBe('Chitrakote');
      expect(res.provider).toBe('passthrough');
      expect(res.cached).toBe(false);
    });

    it('should translate direct regional glossary terms (waterfall -> झरना for cg/hne)', async () => {
      const res = await service.translate('waterfall', 'en', 'cg');
      expect(res.provider).toBe('glossary');
      expect(res.cached).toBe(false);
      expect(res.translatedText).toBe('झरना');
    });

    it('should translate direct regional glossary terms for hne alias', async () => {
      const res = await service.translate('waterfall', 'en', 'hne');
      expect(res.provider).toBe('glossary');
      expect(res.translatedText).toBe('झरना');
    });

    it('should translate direct regional glossary terms for Hindi (temple -> मंदिर)', async () => {
      const res = await service.translate('temple', 'en', 'hi');
      expect(res.provider).toBe('glossary');
      expect(res.translatedText).toBe('मंदिर');
    });

    it('should return cached result from memory on subsequent calls', async () => {
      // First call
      await service.translate('temple', 'en', 'hi');
      // Second call
      const cachedRes = await service.translate('temple', 'en', 'hi');
      expect(cachedRes.cached).toBe(true);
      expect(cachedRes.provider).toBe('memory');
      expect(cachedRes.translatedText).toBe('मंदिर');
    });

    it('should fallback gracefully to original text if Google Translate is unavailable and term is not in glossary', async () => {
      mockGoogleTranslateService.isAvailable.mockReturnValue(false);
      const res = await service.translate('Unrecognized tourism phrase xyz', 'en', 'hi');
      expect(res.translatedText).toBe('Unrecognized tourism phrase xyz');
      expect(res.provider).toBe('original');
      expect(res.cached).toBe(false);
    });

    it('should use Google Translate and apply Chhattisgarhi dialect when Google is available', async () => {
      mockGoogleTranslateService.isAvailable.mockReturnValue(true);
      mockGoogleTranslateService.translateText.mockResolvedValue('यह एक सुंदर जलप्रपात है');

      const res = await service.translate('This is a beautiful waterfall', 'en', 'cg');
      expect(mockGoogleTranslateService.translateText).toHaveBeenCalledWith('This is a beautiful waterfall', 'cg');
      // 'जलप्रपात' is mapped to 'झरना' by glossary post-processing
      expect(res.translatedText).toContain('झरना');
      expect(res.provider).toBe('google');
    });
  });
});
