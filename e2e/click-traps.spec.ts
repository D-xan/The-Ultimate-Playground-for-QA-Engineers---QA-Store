import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/practice/click-traps');
});

test('covered button cannot be clicked until the cover is dismissed', async ({ page }) => {
  await expect(page.locator('#overlapped-button').click({ timeout: 1000 })).rejects.toThrow();
  await page.locator('#overlap-dismiss').click();
  await page.locator('#overlapped-button').click();
  await expect(page.getByTestId('result-overlap')).toHaveAttribute('data-state', 'success');
});

test('moving button is clicked only after it stops', async ({ page }) => {
  await page.locator('#start-animation').click();
  await expect(page.locator('#moving-button')).not.toHaveClass(/animating/, { timeout: 5000 });
  await page.locator('#moving-button').click();
  await expect(page.getByTestId('result-moving')).toHaveAttribute('data-state', 'success');
});

test('second click lands on the hidden layer', async ({ page }) => {
  await page.locator('#green-button').click();
  await expect(page.getByTestId('result-layers')).toHaveAttribute('data-state', 'success');
  await expect(page.locator('#blue-button')).toBeVisible();
  await expect(page.locator('#green-button').click({ timeout: 1000 })).rejects.toThrow();
});

test('input is typed only once it becomes enabled', async ({ page }) => {
  await expect(page.locator('#delayed-input')).toBeDisabled();
  await page.locator('#enable-input').click();
  await expect(page.locator('#delayed-input')).toBeEnabled({ timeout: 6000 });
  await page.locator('#delayed-input').fill('QA');
  await page.locator('#submit-delayed').click();
  await expect(page.getByTestId('result-enabled')).toHaveAttribute('data-state', 'success');
});
