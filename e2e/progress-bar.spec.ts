import { test, expect } from '@playwright/test';

test('stop the progress bar at 75% or more', async ({ page }) => {
  await page.goto('/practice/progress-bar');
  await page.locator('#start-button').click();
  await expect
    .poll(async () => Number(await page.locator('#progress-bar-fill').getAttribute('aria-valuenow')), { timeout: 15_000, intervals: [100] })
    .toBeGreaterThanOrEqual(75);
  await page.locator('#stop-button').click();
  await expect(page.getByTestId('challenge-result')).toHaveAttribute('data-state', 'success');
});

test('waiting for 100% shows the completion message', async ({ page }) => {
  await page.goto('/practice/progress-bar');
  await page.locator('#start-button').click();
  await expect(page.locator('#success-message')).toHaveText('Process Completed Successfully!', { timeout: 15_000 });
});
