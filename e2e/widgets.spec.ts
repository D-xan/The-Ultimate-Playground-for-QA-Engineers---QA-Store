import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/practice/widgets');
});

test('typing the OTP auto-advances through the boxes', async ({ page }) => {
  await page.locator('#otp-0').click();
  await page.keyboard.type('482915');
  await expect(page.locator('#otp-5')).toHaveValue('5');
  await page.locator('#verify-otp').click();
  await expect(page.getByTestId('result-otp')).toHaveAttribute('data-state', 'success');
});

test('pasting the OTP fills every box', async ({ page }) => {
  await page.locator('#otp-0').evaluate((el) => {
    const dt = new DataTransfer();
    dt.setData('text/plain', '48-29 15');
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  });
  for (const [i, d] of [...'482915'].entries()) await expect(page.locator(`#otp-${i}`)).toHaveValue(d);
});

test('OTP rejects letters and a wrong code fails', async ({ page }) => {
  await page.locator('#otp-0').click();
  await page.keyboard.type('a');
  await expect(page.locator('#otp-0')).toHaveValue('');
  await page.keyboard.type('111111');
  await page.locator('#verify-otp').click();
  await expect(page.getByTestId('result-otp')).toHaveAttribute('data-state', 'failure');
});

test('tags are added, de-duplicated and removed', async ({ page }) => {
  const input = page.locator('#tag-input');
  for (const t of ['selenium', 'playwright', 'Selenium', '  ']) { await input.fill(t); await input.press('Enter'); }
  await expect(page.getByTestId('tag')).toHaveCount(2);
  await expect(page.locator('#tag-count')).toHaveText('2 tags');
  await page.getByRole('button', { name: 'Remove playwright' }).click();
  await expect(page.locator('#tag-count')).toHaveText('1 tag');
});

test('star rating', async ({ page }) => {
  await expect(page.locator('#rating-value')).toHaveText('0/5');
  await page.getByRole('radio', { name: '4 stars' }).click();
  await expect(page.locator('#rating-value')).toHaveText('4/5');
  await expect(page.getByRole('radio', { name: '4 stars' })).toHaveAttribute('aria-checked', 'true');
});
