import { test, expect, type Page } from '@playwright/test';

const done = (page: Page, id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'true');
const notDone = (page: Page, id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'false');

test('every Basic Elements task ticks itself when solved', async ({ page }) => {
  await page.goto('/practice/basic');
  await expect(page.getByText('0 of 13 Tasks')).toBeVisible();

  await page.locator('#basic-text').fill('QA Tester');
  await notDone(page, 'basic-text'); // the error path was skipped
  await page.locator('#basic-text').fill('ab');
  await expect(page.locator('#basic-text-error')).toHaveText('Text must be at least 3 characters');
  await page.locator('#basic-text').fill('QA Tester');
  await done(page, 'basic-text');

  const pw = page.locator('#basic-password');
  await pw.fill('abc');
  await expect(page.locator('#basic-password-error')).toContainText('8 characters');
  await pw.fill('abcdefgh');
  await expect(page.locator('#basic-password-error')).toContainText('uppercase');
  await pw.fill('Abcdefgh');
  await done(page, 'basic-password');

  await page.locator('#basic-number').fill('101');
  await expect(page.locator('#basic-number-error')).toBeVisible();
  const valid = { email: 'qa@example.com', number: '100', phone: '+1 555 123 4567', url: 'https://example.com', search: 'selenium tips' };
  for (const [field, value] of Object.entries(valid)) await page.locator(`#basic-${field}`).fill(value);
  await expect(page.locator('[id$="-error"]')).toHaveCount(0);
  await done(page, 'basic-formats');

  await page.getByTestId('answer-basic-hidden').fill(await page.locator('#basic-hidden').inputValue());
  await done(page, 'basic-hidden');

  await expect(page.locator('#basic-readonly')).not.toBeEditable();
  await expect(page.locator('#basic-disabled')).toBeDisabled();
  await page.getByTestId('answer-basic-readonly').fill(await page.locator('#basic-readonly').inputValue());
  await done(page, 'basic-readonly');

  await page.locator('#basic-textarea').fill('Line one\nLine two\nLine three');
  await done(page, 'basic-textarea');

  for (const id of ['btn-normal', 'btn-submit', 'btn-reset', 'btn-fab']) {
    await page.locator(`#${id}`).click();
    await expect(page.locator('#button-message')).toBeVisible();
  }
  await expect(page.locator('#btn-disabled')).toBeDisabled();
  await done(page, 'basic-buttons');

  const btn = page.locator('#btn-loading');
  await btn.click();
  await expect(btn).toBeDisabled();
  await expect(btn).toBeEnabled({ timeout: 5000 });
  await btn.click();
  await done(page, 'btn-loading');

  await page.locator('#chk-multi-1').check();
  await page.locator('#chk-single').check();
  await page.locator('#chk-multi-2').check();
  await notDone(page, 'basic-checkboxes'); // Option A must stay unchecked
  await page.locator('#chk-multi-1').uncheck();
  await done(page, 'basic-checkboxes');

  await page.locator('#radio-no').check();
  await done(page, 'basic-radio');

  await page.locator('#slider-volume').fill('75');
  await expect(page.locator('#slider-value-display')).toHaveText('75');
  await done(page, 'slider-volume');

  await page.getByText('On/Off Switch', { exact: true }).click();
  await expect(page.locator('#toggle-switch-1')).toBeChecked();
  await done(page, 'toggle-switch-1');

  await expect(page.locator('#link-external')).toHaveAttribute('target', '_blank');
  await page.locator('#link-internal').click();
  await expect(page).toHaveURL(/#basic-links-target$/);
  await done(page, 'basic-links');

  await expect(page.getByText('13 of 13 Tasks')).toBeVisible();
});

test('a wrong answer does not tick a read task', async ({ page }) => {
  await page.goto('/practice/basic');
  await page.getByTestId('answer-basic-hidden').fill('secret-guess');
  await notDone(page, 'basic-hidden');
});
