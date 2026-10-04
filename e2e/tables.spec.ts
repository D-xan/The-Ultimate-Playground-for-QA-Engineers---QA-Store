import { test, expect, type Page } from '@playwright/test';

const done = (page: Page, id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'true');
const notDone = (page: Page, id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'false');

test('every Tables & Lists task ticks itself when solved', async ({ page }) => {
  await page.goto('/practice/tables');
  await expect(page.getByText('0 of 5 Tasks')).toBeVisible();

  await expect(page.locator('#table-static tbody tr').filter({ hasText: 'Out of Stock' })).toHaveCount(1);
  const row = page.locator('#table-static tbody tr').filter({ hasText: 'Out of Stock' });
  const price = (await row.locator('td').nth(2).textContent())!.replace(/\D/g, '');
  await page.getByTestId('answer-table-static').fill(price);
  await done(page, 'table-static');

  const header = page.locator('#table-sort-price');
  await header.click();
  await expect(header).toHaveAttribute('aria-sort', 'ascending');
  await notDone(page, 'table-sortable');
  await header.click();
  await expect(header).toHaveAttribute('aria-sort', 'descending');
  const prices = (await page.locator('#table-sortable tbody td:nth-child(2)').allTextContents()).map((t) => +t.slice(1));
  expect(prices).toEqual([...prices].sort((a, b) => b - a));
  await done(page, 'table-sortable');

  await page.locator('#table-filter-status').selectOption('Low Stock');
  const rows = page.locator('#table-filter tbody tr');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
  for (const t of await rows.allTextContents()) expect(t).toContain('Low Stock');
  await expect(page.locator('#table-filter-info')).toHaveText(`Showing ${count} of 12`);
  await page.getByTestId('answer-table-filter').fill(String(count));
  await done(page, 'table-filter');

  const last = await page.locator('#list-unordered li').last().textContent();
  await page.getByTestId('answer-list-unordered').fill(last!);
  await done(page, 'list-unordered');

  await page.locator('#pagination-next').click();
  await page.locator('#pagination-10').click();
  await expect(page.locator('#pagination-next')).toBeDisabled();
  await page.locator('#pagination-prev').click();
  await expect(page.locator('#pagination-info')).toHaveText('Showing page 9 of 10');
  await done(page, 'pagination');

  await expect(page.getByText('5 of 5 Tasks')).toBeVisible();
});
