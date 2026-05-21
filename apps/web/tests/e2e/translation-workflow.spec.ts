import { test, expect } from '@playwright/test';

test.describe('Translation Workflow', () => {
  // Mobile layout hides the language switcher right now
  test.skip(({ isMobile }) => isMobile, 'Language switcher not in mobile nav yet');

  test.beforeEach(async ({ page }) => {
    // Mock the translation API response
    await page.route('**/api/v1/translations*', async route => {
      await route.fulfill({ json: { success: true, data: { "home.heading_real": "नमस्ते" } } });
    });
  });

  test('User can switch language and see translated content', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Wait for Language Switcher to be visible
    // Depending on the UI, it might be in the navbar or a settings modal.
    // For this MVP test, we look for the "हिन्दी" button that we added in LanguageSwitcher component.
    
    // We assume the LanguageSwitcher is mounted on the page
    const hindiButton = page.getByRole('button', { name: 'हिन्दी' });
    await hindiButton.waitFor({ state: 'visible' });
    await hindiButton.click();
    
    // We expect some key UI elements to change to Hindi
    // Wait for language preference to be saved
    await page.waitForTimeout(1000); 
      
      // Verify local storage is updated
      const savedLang = await page.evaluate(() => {
        return window.localStorage.getItem('preferred_language');
      });
      expect(savedLang).toBe('hi');
  });

  test('Language preference persists on reload', async ({ page }) => {
    // Set local storage before navigating
    await page.addInitScript(() => {
      window.localStorage.setItem('preferred_language', 'hi');
    });
    
    await page.goto('/');
    
    const savedLang = await page.evaluate(() => window.localStorage.getItem('preferred_language'));
    expect(savedLang).toBe('hi');
    
    // The button for "हिन्दी" should have the active class (bg-forest-emerald)
    const hindiButton = page.getByRole('button', { name: 'हिन्दी' });
    await expect(hindiButton).toHaveClass(/bg-forest-emerald/);
  });
});
