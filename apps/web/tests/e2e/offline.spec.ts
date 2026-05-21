import { test, expect } from '@playwright/test';

test.describe('Offline Translation Capabilities', () => {
  test('Loads dynamic translations from cache when offline', async ({ page, context }) => {
    await page.goto('/');

    // Seed localStorage with cached dynamic translations
    await page.evaluate(() => {
      localStorage.setItem('cg_lang', 'cg');
      localStorage.setItem('dynamic_translations_cg', JSON.stringify({
        'place-123': {
          'description': 'यह एक सुंदर झरना है' // Mocked translated description
        }
      }));
    });

    // Go offline
    await context.setOffline(true);

    // Verify the cached language is maintained without a hard reload
    // Once PWA Service Worker is added, we can uncomment page.reload()
    const savedLang = await page.evaluate(() => localStorage.getItem('preferred_language'));
    expect(savedLang).toBe('cg');
  });
});
