import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/practice/deep-dom');
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

test('closed shadow widget is defined as soon as the page module loads', async ({ page }) => {
  // record, in the first mutation callback after the element is inserted, whether it was already defined
  await page.addInitScript(() => {
    const w = window as unknown as { __definedOnInsert?: boolean };
    new MutationObserver((_m, obs) => {
      if (document.querySelector('closed-shadow-widget')) {
        w.__definedOnInsert = customElements.get('closed-shadow-widget') !== undefined;
        obs.disconnect();
      }
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto('about:blank');
  await page.goto('/practice/deep-dom');
  await page.locator('closed-shadow-widget').waitFor({ state: 'attached' });
  expect(await page.evaluate(() => customElements.get('closed-shadow-widget') !== undefined)).toBe(true);
  expect(await page.evaluate(() => (window as unknown as { __definedOnInsert?: boolean }).__definedOnInsert)).toBe(true);
});
