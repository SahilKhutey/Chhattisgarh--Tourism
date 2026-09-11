import { test, expect } from '@playwright/test';

test.describe('Admin Template Dashboard E2E Flow', () => {
  test('Admin template dashboard loads with header, stats, and filters', async ({
    page,
  }) => {
    const res = await page.goto('/admin/templates');
    expect(res?.status()).toBeLessThan(500);

    // Verify main heading
    const heading = page.locator('h1');
    await expect(heading).toContainText('Content Templates');

    // Verify statistics section
    const statsSection = page.getByRole('region', { name: 'Template statistics' });
    await expect(statsSection).toBeVisible();

    // Verify filter controls
    const searchInput = page.getByLabel('Search templates');
    await expect(searchInput).toBeVisible();

    const statusFilter = page.getByLabel('Filter by status');
    await expect(statusFilter).toBeVisible();

    const categoryFilter = page.getByLabel('Filter by category');
    await expect(categoryFilter).toBeVisible();

    // Verify Create template button
    const createBtn = page.getByRole('button', { name: 'Create template' });
    await expect(createBtn).toBeVisible();
  });

  test('Create template dialog opens and validates inputs', async ({ page }) => {
    await page.goto('/admin/templates');

    // Click Create template
    const createBtn = page.getByRole('button', { name: 'Create template' });
    await createBtn.click();

    // Verify dialog opened
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Create template' })).toBeVisible();

    // Fill Name and verify auto-generated slug
    const nameInput = page.getByLabel('Name');
    await nameInput.fill('Bastar Tribal Dance');

    const slugInput = page.getByLabel('Slug');
    await expect(slugInput).toHaveValue('bastar-tribal-dance');

    // Close dialog
    const closeBtn = page.getByLabel('Close');
    await closeBtn.click();
    await expect(dialog).not.toBeVisible();
  });
});
