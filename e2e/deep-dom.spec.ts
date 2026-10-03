import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/practice/deep-dom');
});

test('button three iframes deep', async ({ page }) => {
  await page.frameLocator('#frame-level-1').frameLocator('#frame-level-2').frameLocator('#frame-level-3').locator('#deep-button').click();
  await expect(page.getByTestId('result-nested-frames')).toHaveAttribute('data-state', 'success');
});

test('wait for the iframe countdown to finish', async ({ page }) => {
  await expect(page.frameLocator('#countdown-frame').locator('#countdown-done')).toHaveText('Liftoff!', { timeout: 10_000 });
});

test('closed shadow root is driven with the keyboard', async ({ page }) => {
  expect(await page.locator('closed-shadow-widget input').count()).toBe(0);
  await page.locator('#before-shadow').focus();
  await page.keyboard.press('Tab');
  await page.keyboard.type('shadow');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('result-closed-shadow')).toHaveAttribute('data-state', 'success');
});

test('open shadow DOM inside an iframe', async ({ page }) => {
  const frame = page.frameLocator('#shadow-frame');
  await frame.locator('#shadow-frame-button').click();
  await expect(frame.locator('#shadow-frame-status')).toHaveText('Clicked inside shadow in frame');
  await expect(page.getByTestId('result-shadow-frame')).toHaveAttribute('data-state', 'success');
});
