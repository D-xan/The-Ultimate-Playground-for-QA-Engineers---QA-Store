import { test, expect } from '@playwright/test';

for (const [path, heading] of [['/about', 'About QA Playground'], ['/privacy-policy', 'Privacy Policy'], ['/terms-of-service', 'Terms of Service'], ['/contact', 'Contact']]) {
  test(`${path} renders, is indexable and has its own canonical`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect.poll(() => page.locator('link[rel=canonical]').getAttribute('href')).toMatch(new RegExp(`${path}$`));
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'index, follow');
  });
}

test('the practice footer links to every info page', async ({ page }) => {
  await page.goto('/practice');
  const footer = page.getByTestId('site-footer');
  for (const name of ['About', 'Privacy Policy', 'Terms of Service', 'Contact']) await expect(footer.getByRole('link', { name })).toBeVisible();
  await footer.getByRole('link', { name: 'Privacy Policy' }).click();
  await expect(page).toHaveURL(/\/privacy-policy$/);
});

test('the store footer has no dead links', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('footer a[href="#"]').count()).toBe(0);
});

test('the login page shows the demo accounts and its labels name the inputs', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByTestId('demo-accounts')).toContainText('customer@example.com');
  await page.getByLabel('Email Address').fill('customer@example.com');
  await page.getByLabel('Password').fill('customer123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).not.toHaveURL(/\/login$/);
});
