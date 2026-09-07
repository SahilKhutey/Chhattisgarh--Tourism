import { translateText } from '../../src/lib/i18n/translator';
import { getCachedTranslation, setCachedTranslation } from '../../src/lib/i18n/cache';

describe('i18n Translator & Glossary Pipeline', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should return passthrough when source and target languages are the same', async () => {
    const res = await translateText({ text: 'Bastar Art', source: 'en', target: 'en' });
    expect(res.translatedText).toBe('Bastar Art');
    expect(res.provider).toBe('passthrough');
    expect(res.cached).toBe(false);
  });

  it('should return passthrough on empty or whitespace strings', async () => {
    const res = await translateText({ text: '   ', source: 'en', target: 'hi' });
    expect(res.translatedText).toBe('');
    expect(res.provider).toBe('passthrough');
  });

  it('should translate regional glossary terms to Chhattisgarhi without calling API', async () => {
    const res = await translateText({ text: 'waterfall', source: 'en', target: 'hne' });
    expect(res.translatedText).toBe('झरना');
    expect(res.provider).toBe('glossary');
    expect(res.cached).toBe(false);
  });

  it('should translate regional glossary terms for temple to devgudi for Chhattisgarhi', async () => {
    const res = await translateText({ text: 'temple', source: 'en', target: 'hne' });
    expect(res.translatedText).toBe('देवगुड़ी');
    expect(res.provider).toBe('glossary');
  });

  it('should translate regional glossary terms to Hindi', async () => {
    const res = await translateText({ text: 'temple', source: 'en', target: 'hi' });
    expect(res.translatedText).toBe('मंदिर');
    expect(res.provider).toBe('glossary');
  });

  it('should return cached translation from memory cache on subsequent calls', async () => {
    setCachedTranslation('Custom Heritage Site', 'en', 'hi', 'कस्टम हेरिटेज');
    const res = await translateText({ text: 'Custom Heritage Site', source: 'en', target: 'hi' });
    expect(res.translatedText).toBe('कस्टम हेरिटेज');
    expect(res.provider).toBe('memory');
    expect(res.cached).toBe(true);
  });

  it('should fetch from API when term is not in glossary and return API response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        text: 'Chitrakote is magnificent',
        source: 'en',
        target: 'hi',
        translatedText: 'चित्रकोट भव्य है',
        provider: 'google',
        cached: false,
      }),
    });

    const res = await translateText({ text: 'Chitrakote is magnificent', source: 'en', target: 'hi' });
    expect(res.translatedText).toBe('चित्रकोट भव्य है');
    expect(res.provider).toBe('google');
  });

  it('should gracefully fallback to original text if API fails and term not in glossary', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network offline'));

    const res = await translateText({ text: 'Unknown phrase xyz', source: 'en', target: 'hi' });
    expect(res.translatedText).toBe('Unknown phrase xyz');
    expect(res.provider).toBe('fallback');
  });
});
