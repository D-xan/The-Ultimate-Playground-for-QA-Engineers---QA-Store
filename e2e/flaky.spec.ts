import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/practice/flaky');
});

test('retry the unreliable request until it succeeds', async ({ page }) => {
  for (let attempt = 0; attempt < 20; attempt++) {
    await page.locator('#load-data').click();
    await expect(page.locator('#flaky-data, #flaky-error')).toBeVisible();
    if (await page.locator('#flaky-data').isVisible()) break;
  }
  await expect(page.locator('#flaky-data li')).toHaveCount(3);
  await expect(page.getByTestId('result-unreliable')).toHaveAttribute('data-state', 'success');
});

test('wait for a job with a random duration', async ({ page }) => {
  await page.locator('#slow-button').click();
  await expect(page.locator('#slow-result')).toContainText('Done after', { timeout: 7000 });
});

test('click an element that is re-rendered', async ({ page }) => {
  await page.locator('#refresh-list').click();
  await page.locator('#rerender-list').getByRole('button', { name: 'Target' }).click();
  await expect(page.getByTestId('result-rerender')).toHaveAttribute('data-state', 'success');
});

test('assert a counter with a retrying assertion', async ({ page }) => {
  await page.locator('#start-counter').click();
  await expect(page.locator('#async-counter')).toHaveText('3', { timeout: 5000 });
});
