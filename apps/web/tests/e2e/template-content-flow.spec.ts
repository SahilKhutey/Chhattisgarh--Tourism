import { test, expect } from '@playwright/test';

test.describe('Generic Tourism Content Template Engine E2E Flow', () => {
  test('Admin template list page loads and presents creation action', async ({
    page,
  }) => {
    const res = await page.goto('/admin/templates');
    expect(res?.status()).toBeLessThan(500);

    const heading = page.locator('h1');
    await expect(heading).toContainText('Content Template Engine');

    const createBtn = page.getByRole('link', { name: /Create New Template/i });
    await expect(createBtn).toBeVisible();
  });

  test('Admin new template builder displays Field Palette with canonical fields and Live Preview', async ({
    page,
  }) => {
    const res = await page.goto('/admin/templates/new');
    expect(res?.status()).toBeLessThan(500);

    // Verify Builder Heading
    await expect(page.locator('h1')).toContainText('New Content Template');

    // Verify Palette
    await expect(page.getByText('Field Palette')).toBeVisible();
    await expect(page.getByText('Geo Point')).toBeVisible();
    await expect(page.getByText('Rich Text')).toBeVisible();
    await expect(page.getByText('Dropdown')).toBeVisible();

    // Verify Live Preview panel
    await expect(page.getByText('Live Form Preview')).toBeVisible();

    // Fill template metadata
    await page.getByPlaceholder('e.g. Traditional Festival').fill('Tribal Handloom Art');
    await expect(page.getByPlaceholder('e.g. traditional-festival')).toHaveValue('tribal-handloom-art');

    // Click on a field in palette to add to canvas
    await page.getByRole('button', { name: /Text Single-line text/i }).click();

    // Verify canvas now has 1 field
    await expect(page.getByText('Template Canvas (1 field)')).toBeVisible();
  });

  test('Creator hub loads and displays dynamic entry authoring navigation', async ({
    page,
  }) => {
    const res = await page.goto('/creator/entries');
    expect(res?.status()).toBeLessThan(500);

    await expect(page.locator('h1')).toContainText('My Tourism Contributions');
    await expect(page.getByText('Creator Portal')).toBeVisible();
  });
});
