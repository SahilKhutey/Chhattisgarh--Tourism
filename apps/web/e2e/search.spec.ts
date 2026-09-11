import { test, expect } from '@playwright/test';

test.describe('Tourism Search', () => {
  test('searches tourism content', async ({ page }) => {
    await page.goto('/en/search');

    const input = page.getByRole('combobox', {
      name: /search tourism/i,
    });

    await expect(input).toBeVisible();
    await input.fill('waterfall');
    await input.press('Enter');

    await expect(page).toHaveURL(/q=waterfall/);
  });

  test('supports district filtering', async ({ page }) => {
    await page.goto('/en/search?q=waterfall&district=Bastar');

    await expect(page).toHaveURL(/district=Bastar/);
  });

  test('shows zero-result state', async ({ page }) => {
    await page.goto('/en/search?q=xyz-nonexistent-123');

    await expect(page.getByTestId('search-empty-state')).toBeVisible();
    await expect(page.getByText(/no places matched/i)).toBeVisible();
  });
});
