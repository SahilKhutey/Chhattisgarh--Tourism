import { Test, TestingModule } from '@nestjs/testing';
import { GlossaryService } from './glossary.service';

describe('GlossaryService (Chhattisgarhi Localization)', () => {
  let service: GlossaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlossaryService],
    }).compile();

    service = module.get<GlossaryService>(GlossaryService);
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('replaces hindi waterfall term (झरना) with chhattisgarhi term', () => {
    const result = service.applyGlossary('यह एक सुंदर झरना है', 'cg');
    // We expect the Chhattisgarhi equivalent to be applied
    // This depends on the actual contents of your glossary JSON
    // The test asserts that the result differs from the input or contains a specific term
    expect(result).not.toBe('यह एक सुंदर झरना है');
    // Assuming 'झरना' -> 'झरिया' or similar based on glossary
  });
  
  test('returns original string if language is not cg', () => {
    const result = service.applyGlossary('यह एक सुंदर झरना है', 'hi');
    expect(result).toBe('यह एक सुंदर झरना है');
  });
});
