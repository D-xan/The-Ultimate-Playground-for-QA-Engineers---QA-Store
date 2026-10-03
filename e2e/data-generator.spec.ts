import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/practice/data-generator');
});

test('generates rows and previews ten of them', async ({ page }) => {
  await page.locator('#row-count').fill('25');
  await page.locator('#generate').click();
  await expect(page.locator('#rows-generated')).toHaveText('25 rows generated');
  await expect(page.locator('#preview-table tbody tr')).toHaveCount(10);
});

test('downloads SQL', async ({ page }) => {
  await page.locator('#format').selectOption('sql');
  await page.locator('#generate').click();
  const download = page.waitForEvent('download');
  await page.locator('#download-data').click();
  expect((await download).suggestedFilename()).toBe('test-data.sql');
});

test('rejects duplicate field names', async ({ page }) => {
  await page.getByTestId('field-name').nth(1).fill('id');
  await page.locator('#generate').click();
  await expect(page.locator('#generator-error')).toBeVisible();
});

test('rejects reserved field names', async ({ page }) => {
  await page.getByTestId('field-name').nth(1).fill('__proto__');
  await page.locator('#generate').click();
  await expect(page.locator('#generator-error')).toBeVisible();
  await expect(page.locator('#generator-error')).toContainText('__proto__');
});
