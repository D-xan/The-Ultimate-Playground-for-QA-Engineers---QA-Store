import { test, expect } from '@playwright/test';

test('groups on one page are independent', async ({ page }) => {
  await page.goto('/#/practice/basic');
  await page.getByTestId('task-toggle-buttons-0').click();
  await expect(page.getByTestId('task-toggle-buttons-0').locator('svg')).toHaveClass(/text-green-500/);
  await expect(page.getByTestId('task-toggle-inputs-0').locator('svg')).not.toHaveClass(/text-green-500/);
});

test('Reset All clears task progress', async ({ page }) => {
  await page.goto('/#/practice/basic');
  await page.getByTestId('task-toggle-inputs-0').click();
  await expect(page.getByTestId('task-toggle-inputs-0').locator('svg')).toHaveClass(/text-green-500/);
  await page.getByRole('button', { name: 'Reset All' }).click();
  await page.waitForLoadState('load');
  await expect(page.getByTestId('task-toggle-inputs-0').locator('svg')).not.toHaveClass(/text-green-500/);
});

test('old v2 progress data does not break the portal', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('qa-playground-progress-v2', JSON.stringify({ state: { completedTasks: { basic: [0] }, totalTasks: { basic: 3 } }, version: 0 }))
  );
  await page.goto('/#/practice');
  await expect(page.getByTestId('challenge-card-basic')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('qa-playground-progress-v2'))).toBeNull();
});
