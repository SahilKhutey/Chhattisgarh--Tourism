import { detectLanguage } from '../../../src/i18n/detector';

describe('Language Detection', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset navigator language mock
    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      configurable: true,
    });
  });

  test('returns saved language preference', () => {
    localStorage.setItem('cg_lang', 'hi');
    expect(detectLanguage()).toBe('hi');
  });

  test('falls back to browser language', () => {
    Object.defineProperty(navigator, 'language', {
      value: 'hi-IN',
      configurable: true,
    });
    expect(detectLanguage()).toBe('hi');
  });

  test('falls back to english', () => {
    Object.defineProperty(navigator, 'language', {
      value: 'fr-FR',
      configurable: true,
    });
    expect(detectLanguage()).toBe('en');
  });
});
