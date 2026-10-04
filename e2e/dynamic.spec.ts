import { test, expect, type Page } from '@playwright/test';

const done = (page: Page, id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'true');
const notDone = (page: Page, id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'false');

test('every Dynamic Waits task ticks itself when solved', async ({ page }) => {
  test.slow(); // random delays of up to 5 seconds
  await page.goto('/practice/dynamic');
  await expect(page.getByText('0 of 5 Tasks')).toBeVisible();

  await page.locator('#btn-load-delayed').click();
  await expect(page.locator('#btn-delayed')).toHaveCount(0);
  await page.locator('#btn-delayed').click({ timeout: 8000 });
  await done(page, 'btn-delayed');

  await page.locator('#btn-save').click();
  await page.locator('#btn-continue').click();
  await expect(page.locator('#continue-result')).toHaveText('Too early: still saving');
  await notDone(page, 'btn-disappearing');
  await expect(page.locator('#saving-spinner')).toBeHidden({ timeout: 8000 });
  await page.locator('#btn-continue').click();
  await expect(page.locator('#continue-result')).toHaveText('Continued after save');
  await done(page, 'btn-disappearing');

  await page.getByRole('button', { name: 'My ID changes every 3s' }).click();
  await done(page, 'dynamic-id');

  await page.locator('#btn-start-progress').click();
  await expect(page.locator('#progress-receipt')).toHaveCount(0);
  await expect(page.locator('#progress-text')).toHaveText('100% Complete', { timeout: 10000 });
  const receipt = await page.locator('#progress-receipt').textContent();
  await page.getByTestId('answer-progress-task').fill(receipt!.match(/R-\d+/)![0]);
  await done(page, 'progress-task');

  await page.locator('#btn-load-profile').click();
  const name = await page.locator('#profile-username').textContent({ timeout: 8000 });
  await page.getByTestId('answer-skeleton').fill(name!);
  await done(page, 'skeleton');

  await expect(page.getByText('5 of 5 Tasks')).toBeVisible();
});
