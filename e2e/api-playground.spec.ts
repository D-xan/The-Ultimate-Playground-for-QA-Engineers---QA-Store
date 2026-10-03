import { test, expect } from '@playwright/test';

test('login, use the token, create a user', async ({ page }) => {
  await page.goto('/#/practice/api-playground');
  await page.locator('#api-method').selectOption('POST');
  await page.locator('#api-path').fill('/api/auth/login');
  await page.locator('#api-body').fill('{"username":"qa","password":"qa123"}');
  await page.locator('#api-send').click();
  await expect(page.locator('#api-status')).toHaveText('200');
  await page.locator('#use-token').click();
  await page.locator('#api-path').fill('/api/users');
  await page.locator('#api-body').fill('{"name":"Ada","email":"ada@x.io"}');
  await page.locator('#api-send').click();
  await expect(page.locator('#api-status')).toHaveText('201');
  await expect(page.locator('#api-response')).toContainText('"Ada"');
});

test('write without a token is 401', async ({ page }) => {
  await page.goto('/#/practice/api-playground');
  await page.locator('#api-method').selectOption('DELETE');
  await page.locator('#api-path').fill('/api/users/1');
  await page.locator('#api-send').click();
  await expect(page.locator('#api-status')).toHaveText('401');
});
