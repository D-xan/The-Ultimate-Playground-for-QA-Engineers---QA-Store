import { test, expect } from '@playwright/test';

test('solving one element ticks only that element', async ({ page }) => {
  await page.goto('/practice/basic');
  await page.locator('#radio-no').check();
  await expect(page.getByTestId('element-basic-radio')).toHaveAttribute('data-done', 'true');
  await expect(page.getByTestId('element-basic-textarea')).toHaveAttribute('data-done', 'false');
});

test('Reset All clears task progress', async ({ page }) => {
  await page.goto('/practice/basic');
  await page.locator('#radio-no').check();
  await expect(page.getByTestId('element-basic-radio')).toHaveAttribute('data-done', 'true');
  await page.getByRole('button', { name: 'Reset All' }).click();
  await page.waitForLoadState('load');
  await expect(page.getByTestId('element-basic-radio')).toHaveAttribute('data-done', 'false');
});

test('old v2 progress data does not break the portal', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('qa-playground-progress-v2', JSON.stringify({ state: { completedTasks: { basic: [0] }, totalTasks: { basic: 3 } }, version: 0 }))
  );
  await page.goto('/practice');
  await expect(page.getByTestId('challenge-card-basic')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('qa-playground-progress-v2'))).toBeNull();
});

test('solving a challenge ticks its task without the checkbox', async ({ page }) => {
  await page.goto('/practice/progress-bar');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect.poll(async () => Number(await page.locator('[aria-valuenow]').getAttribute('aria-valuenow')), { timeout: 15000 }).toBeGreaterThanOrEqual(75);
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect(page.getByTestId('task-toggle-main-0').locator('svg')).toHaveClass(/text-green-500/);
  await expect(page.getByText('1 of 2 Tasks')).toBeVisible();
});

test('a task group named after its result box is ticked on success', async ({ page }) => {
  await page.goto('/practice/locator-traps');
  await expect(page.getByTestId('task-toggle-nbsp-0').locator('svg')).not.toHaveClass(/text-green-500/);
  await page.getByTestId('result-nbsp').locator('xpath=preceding::button[1]').click();
  await expect(page.getByTestId('result-nbsp')).toHaveAttribute('data-state', 'success');
  await expect(page.getByTestId('task-toggle-nbsp-0').locator('svg')).toHaveClass(/text-green-500/);
});
