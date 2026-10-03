import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/practice/virtual-table');
  await expect(page.locator('main h1')).toBeVisible();
});

test('only a few rows are in the DOM', async ({ page }) => {
  const rows = page.locator('#virtual-grid [data-row-id]');
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeLessThan(40);
  await expect(page.locator('#virtual-grid')).toHaveAttribute('aria-rowcount', '10000');
});

test('scroll to row 7342 and select it', async ({ page }) => {
  const grid = page.locator('#virtual-grid');
  await grid.evaluate((el) => { el.scrollTop = (7342 - 1) * 40; });
  const row = grid.locator('[data-row-id="7342"]');
  await row.getByRole('button', { name: 'Select' }).click();
  await expect(page.locator('#selected-email')).toHaveText(/7342@example\.test$/);
  await expect(page.getByTestId('result-find')).toHaveAttribute('data-state', 'success');
});

test('sort by score and pick the top row', async ({ page }) => {
  await page.locator('#sort-score').click();
  await expect(page.locator('#sort-score')).toHaveAttribute('aria-sort', 'descending');
  await page.locator('#virtual-grid [data-row-id]').first().getByRole('button', { name: 'Select' }).click();
  await expect(page.getByTestId('result-sort')).toHaveAttribute('data-state', 'success');
});

test('the last row renders at the bottom', async ({ page }) => {
  const grid = page.locator('#virtual-grid');
  await grid.evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await expect(grid.locator('[data-row-id="10000"]')).toBeVisible();
});
