import { Test, TestingModule } from '@nestjs/testing';
import { AiProcessorService } from './ai-processor.service';

describe('AiProcessorService Unit Tests', () => {
  let service: AiProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiProcessorService],
    }).compile();

    service = module.get<AiProcessorService>(AiProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Rules-based Content Classification', () => {
    it('should detect Chitrakote Falls and Waterfalls category', async () => {
      const result = await service.processContent(
        'Exploring the magnificent Chitrakote waterfall during monsoon season!',
        ['tourism', 'monsoon'],
      );

      expect(result.isTravelRelated).toBe(true);
      expect(result.detectedLocation).toBe('Chitrakote Falls');
      expect(result.detectedCategory).toBe('Waterfalls');
      expect(result.suggestedTags).toContain('waterfalls');
      expect(result.suggestedTags).toContain('chhattisgarh');
    });

    it('should detect Bastar and Culture category', async () => {
      const result = await service.processContent(
        'Celebrating Bastar Dussehra festival and tribal folk dance traditions',
        ['bastar', 'festival'],
      );

      expect(result.isTravelRelated).toBe(true);
      expect(result.detectedLocation).toBe('Bastar');
      expect(result.detectedCategory).toBe('Culture');
    });

    it('should detect Tirathgarh Falls and Nature category', async () => {
      const result = await service.processContent(
        'Hiking through Kanger Valley to reach Tirathgarh falls and explore green nature',
        ['travel'],
      );

      expect(result.isTravelRelated).toBe(true);
      expect(result.detectedLocation).toBe('Tirathgarh Falls');
      expect(result.detectedCategory).toBe('Waterfalls');
    });

    it('should classify non-travel meme content as not travel related', async () => {
      const result = await service.processContent(
        'Check out this hilarious political meme and funny joke',
        ['meme', 'politics'],
      );

      expect(result.isTravelRelated).toBe(false);
      expect(result.detectedLocation).toBeNull();
      expect(result.detectedCategory).toBeNull();
      expect(result.suggestedTags).toEqual([]);
    });

    it('should reject generic text with zero tourism keywords', async () => {
      const result = await service.processContent(
        'Daily software engineering update and codebase review',
        ['coding', 'tech'],
      );

      expect(result.isTravelRelated).toBe(false);
      expect(result.detectedLocation).toBeNull();
    });
  });
});
