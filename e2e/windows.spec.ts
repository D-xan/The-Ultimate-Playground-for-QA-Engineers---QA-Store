import { test, expect, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/practice/windows');
  await expect(page.locator('main h1')).toBeVisible();
});

test('read a secret from a new tab', async ({ page, context }) => {
  const tabPromise = context.waitForEvent('page');
  await page.locator('#open-tab').click();
  const tab = await tabPromise;
  const secret = (await tab.locator('#tab-secret').innerText()).trim();
  await tab.close();
  await page.locator('#tab-secret-input').fill(secret);
  await page.locator('#check-secret').click();
  await expect(page.getByTestId('result-tab')).toHaveAttribute('data-state', 'success');
});

test('approve in a popup that closes itself', async ({ page }) => {
  const popupPromise = page.waitForEvent('popup');
  await page.locator('#open-popup').click();
  const popup = await popupPromise;
  await popup.locator('#approve-btn').click();
  await expect.poll(() => popup.isClosed()).toBe(true);
  await expect(page.locator('#approval-code')).toHaveText(/^[A-Z0-9]{6}$/);
  await expect(page.getByTestId('result-popup')).toHaveAttribute('data-state', 'success');
});

test('wait for a slow popup', async ({ page }) => {
  const popupPromise = page.waitForEvent('popup');
  await page.locator('#open-delayed').click();
  const popup = await popupPromise;
  await popup.locator('#delayed-confirm').click({ timeout: 5000 });
  await expect(page.getByTestId('result-delayed')).toHaveAttribute('data-state', 'success');
});

test('find the window by its title', async ({ page, context }) => {
  for (const w of ['a', 'b', 'c']) await page.locator(`#open-${w}`).click();
  await expect.poll(() => context.pages().length).toBe(4);
  let target: Page | undefined;
  for (const p of context.pages()) {
    if (p === page) continue;
    await expect(p).toHaveTitle(/^Window [ABC]$/);
    if ((await p.title()) === 'Window B') target = p;
  }
  await target!.locator('#pick-me').click();
  await expect(page.getByTestId('result-pick')).toHaveAttribute('data-state', 'success');
});

test('a wrong secret fails', async ({ page }) => {
  await page.locator('#tab-secret-input').fill('nope');
  await page.locator('#check-secret').click();
  await expect(page.getByTestId('result-tab')).toHaveAttribute('data-state', 'failure');
});

test('a popup opened directly says it has no opener', async ({ page }) => {
  await page.goto('/popup/approve');
  await expect(page.locator('#no-opener')).toBeVisible();
});
