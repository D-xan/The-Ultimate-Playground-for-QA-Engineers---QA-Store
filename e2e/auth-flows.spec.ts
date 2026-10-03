import { test, expect, type Page } from '@playwright/test';

const PATH = '/#/practice/auth-flows';

async function login(page: Page, remember = false) {
  await page.locator('#auth-email').fill('tester@qa.test');
  await page.locator('#auth-password').fill('Passw0rd!');
  if (remember) await page.locator('#remember-me').check();
  await page.locator('#auth-login').click();
  const code = page.locator('#inbox-code');
  await expect(code).toHaveText(/^\d{6}$/, { timeout: 5000 });
  await page.locator('#auth-otp').fill(await code.innerText());
  await page.locator('#auth-verify').click();
  await expect(page.locator('#auth-dashboard')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto(PATH);
  await expect(page.locator('main h1')).toBeVisible();
});

test('two-step login with a code from the inbox', async ({ page }) => {
  await login(page);
  await expect(page.getByTestId('result-2fa')).toHaveAttribute('data-state', 'success');
});

test('wrong password and wrong code are rejected', async ({ page }) => {
  await page.locator('#auth-email').fill('tester@qa.test');
  await page.locator('#auth-password').fill('wrong');
  await page.locator('#auth-login').click();
  await expect(page.locator('#login-error')).toBeVisible();
  await page.locator('#auth-password').fill('Passw0rd!');
  await page.locator('#auth-login').click();
  const code = page.locator('#inbox-code');
  await expect(code).toHaveText(/^\d{6}$/, { timeout: 5000 });
  await page.locator('#auth-otp').fill((await code.innerText()) === '000000' ? '111111' : '000000');
  await page.locator('#auth-verify').click();
  await expect(page.locator('#otp-error')).toBeVisible();
  await expect(page.getByTestId('result-2fa')).toHaveAttribute('data-state', 'pending');
});

test('survive a session that expires mid-wizard', async ({ page }) => {
  test.setTimeout(45_000);
  await login(page);
  await page.locator('#start-wizard').click();
  await expect(page.locator('#wizard-step')).toHaveText('Step 1 of 3');
  await page.locator('#wizard-next').click();
  await expect(page.locator('#wizard-next')).toBeEnabled({ timeout: 12_000 });
  await page.locator('#wizard-next').click();
  await expect(page.locator('#session-expired-modal')).toBeVisible();
  await page.locator('#reauth-password').fill('Passw0rd!');
  await page.locator('#reauth-submit').click();
  await expect(page.locator('#session-expired-modal')).toBeHidden();
  await expect(page.locator('#wizard-step')).toHaveText('Step 2 of 3');
  await page.locator('#wizard-next').click();
  await page.locator('#wizard-finish').click();
  await expect(page.getByTestId('result-session')).toHaveAttribute('data-state', 'success');
});

test('remember me survives a new browser context', async ({ page, browser }) => {
  await login(page, true);
  const state = await page.context().storageState();
  const ctx = await browser.newContext({ storageState: state });
  const fresh = await ctx.newPage();
  await fresh.goto(new URL(page.url()).origin + PATH);
  await expect(fresh.locator('#session-restored')).toBeVisible();
  await expect(fresh.getByTestId('result-remember')).toHaveAttribute('data-state', 'success');
  await ctx.close();
});

test('without remember me a reload shows the login form', async ({ page }) => {
  await login(page);
  await page.reload();
  await expect(page.locator('#auth-login')).toBeVisible();
});

test('a corrupt stored session falls back to login', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('qa-auth-session', 'garbage'));
  await page.reload();
  await expect(page.locator('#auth-login')).toBeVisible();
});

test('after logging out of a restored session, a fresh login is not "restored"', async ({ page }) => {
  await login(page, true);
  await page.reload();
  await expect(page.locator('#session-restored')).toBeVisible();
  await page.locator('#auth-logout').click();
  await login(page);
  await expect(page.locator('#session-restored')).toBeHidden();
});
