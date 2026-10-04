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

test('each solved part ticks its own task', async ({ page }) => {
  test.slow();
  const done = (id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'true');
  await expect(page.getByText('0 of 4 Tasks')).toBeVisible();
  for (let attempt = 0; attempt < 20; attempt++) {
    await page.locator('#load-data').click();
    await expect(page.locator('#flaky-data, #flaky-error')).toBeVisible();
    if (await page.locator('#flaky-data').isVisible()) break;
  }
  await done('unreliable');

  await page.locator('#slow-button').click();
  const text = await page.locator('#slow-result').textContent({ timeout: 7000 });
  await page.getByTestId('answer-random-delay').fill(text!.match(/\d+/)![0]);
  await done('random-delay');

  await page.locator('#refresh-list').click();
  await page.locator('#rerender-list').getByRole('button', { name: 'Target' }).click();
  await done('rerender');

  await page.locator('#start-counter').click();
  await page.locator('#verify-counter').click();
  await expect(page.getByTestId('result-counter')).toHaveAttribute('data-state', 'failure');
  await expect(page.locator('#async-counter')).toHaveText('3', { timeout: 5000 });
  await page.locator('#verify-counter').click();
  await done('counter');
  await expect(page.getByText('4 of 4 Tasks')).toBeVisible();
});
