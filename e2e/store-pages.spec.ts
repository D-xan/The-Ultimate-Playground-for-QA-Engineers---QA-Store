import { test, expect, type Page } from '@playwright/test';

const done = (page: Page, id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'true');

test('Store Pagination tasks tick themselves when solved', async ({ page }) => {
  await page.goto('/practice/pagination-test');
  await expect(page.getByText('0 of 2 Tasks')).toBeVisible();
  await expect(page.locator('#pagination-info')).toHaveText('Showing page 1 of 10');

  const wanted = (await page.locator('#find-target').textContent())!;
  while (!(await page.getByTestId('product-card').locator('h3', { hasText: wanted }).count())) {
    const before = await page.locator('#pagination-info').textContent();
    await page.locator('#pagination-next').click();
    await expect(page.locator('#pagination-info')).not.toHaveText(before!);
  }
  const pageNo = (await page.locator('#pagination-info').textContent())!.match(/page (\d+)/)![1];
  await page.getByTestId('answer-pagination-find').fill(pageNo);
  await done(page, 'pagination-find');

  await page.locator('#pagination-10').click();
  await expect(page.locator('#pagination-info')).toHaveText('Showing page 10 of 10');
  await expect(page.locator('#pagination-next')).toBeDisabled();
  const name = await page.getByTestId('product-card').last().locator('h3').textContent();
  await page.getByTestId('answer-pagination-last').fill(name!.trim());
  await done(page, 'pagination-last');
  await expect(page.getByText('2 of 2 Tasks')).toBeVisible();
});

test('Store Lazy Loading tasks tick themselves when solved', async ({ page }) => {
  test.slow();
  await page.goto('/practice/lazy-load');
  await expect(page.getByText('0 of 2 Tasks')).toBeVisible();
  const cards = page.getByTestId('product-card');
  await expect(cards).toHaveCount(4);

  const scrollDown = () => page.evaluate(() => document.querySelector('#lazy-loading-indicator, #lazy-end-message')?.scrollIntoView());
  while ((await cards.count()) < 13) {
    await scrollDown();
    await page.waitForTimeout(250);
  }
  const name = await cards.nth(12).locator('h3').textContent();
  await page.getByTestId('answer-lazy-nth').fill(name!.trim());
  await done(page, 'lazy-nth');

  const end = page.locator('#lazy-end-message');
  while (!(await end.isVisible())) {
    await scrollDown();
    await page.waitForTimeout(250);
  }
  const count = await cards.count();
  expect(count).toBeGreaterThanOrEqual(18);
  await page.getByTestId('answer-lazy-count').fill(String(count));
  await done(page, 'lazy-count');
  await expect(page.getByText('2 of 2 Tasks')).toBeVisible();
});
