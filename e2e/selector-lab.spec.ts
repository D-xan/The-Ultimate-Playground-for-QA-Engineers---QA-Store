import { test, expect } from '@playwright/test';

test('CSS selector highlights matches', async ({ page }) => {
  await page.goto('/#/practice/progress-bar');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('#start-button');
  await expect(page.locator('#selector-count')).toHaveText('1 match');
  await expect(page.locator('#start-button')).toHaveAttribute('data-selector-lab-match', '');
  await expect(page.locator('#selector-kind')).toHaveText('CSS');
});

test('XPath is detected and counted', async ({ page }) => {
  await page.goto('/#/practice/progress-bar');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('//h1');
  await expect(page.locator('#selector-kind')).toHaveText('XPath');
  await expect(page.locator('#selector-count')).toHaveText('1 match');
});

test('invalid selector shows an error', async ({ page }) => {
  await page.goto('/#/practice/progress-bar');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('##nope');
  await expect(page.locator('#selector-error')).toBeVisible();
});

test('pierces open shadow DOM inside iframes only when enabled', async ({ page }) => {
  await page.goto('/#/practice/deep-dom');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('#shadow-frame-button');
  await expect(page.locator('#selector-count')).toHaveText('1 match');
  await page.locator('#include-frames').uncheck();
  await expect(page.locator('#selector-count')).toHaveText('0 matches');
});

test('closing the lab removes highlights', async ({ page }) => {
  await page.goto('/#/practice/progress-bar');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('button');
  await expect(page.locator('[data-selector-lab-match]').first()).toBeAttached();
  await page.locator('#selector-lab-toggle').click();
  await expect(page.locator('[data-selector-lab-match]')).toHaveCount(0);
});
