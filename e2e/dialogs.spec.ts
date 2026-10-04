import { test, expect, type Page } from '@playwright/test';

const done = (page: Page, id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'true');
const notDone = (page: Page, id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'false');

test('every Popups & Dialogs task ticks itself when solved', async ({ page }) => {
  await page.goto('/practice/dialogs');
  await expect(page.getByText('0 of 6 Tasks')).toBeVisible();

  page.once('dialog', async (d) => { expect(d.message()).toBe('This is a native alert dialog!'); await d.accept(); });
  await page.locator('#btn-alert').click();
  await expect(page.locator('#alert-result')).toHaveText('Alert was triggered and accepted');
  await done(page, 'btn-alert');

  page.once('dialog', (d) => d.accept());
  await page.locator('#btn-confirm').click();
  await notDone(page, 'btn-confirm');
  page.once('dialog', (d) => d.dismiss());
  await page.locator('#btn-confirm').click();
  await expect(page.locator('#confirm-result')).toHaveText('Confirm cancelled');
  await done(page, 'btn-confirm');

  const name = await page.locator('#prompt-code').textContent();
  page.once('dialog', (d) => d.accept(name!));
  await page.locator('#btn-prompt').click();
  await expect(page.locator('#prompt-result')).toHaveText(`Prompt returned: ${name}`);
  await done(page, 'btn-prompt');

  await page.locator('#btn-open-modal').click();
  await page.locator('#btn-modal-confirm').click();
  await notDone(page, 'custom-modal'); // Escape was never tried
  await page.locator('#btn-open-modal').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#custom-modal')).toBeHidden();
  await page.locator('#btn-open-modal').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
  await expect(page.locator('#modal-result')).toHaveText('Custom modal confirmed');
  await done(page, 'custom-modal');

  await page.locator('#btn-show-toast').click();
  const text = await page.locator('#toast-message').textContent();
  await page.getByTestId('answer-toast').fill(text!.match(/ORDER-\d+/)![0]);
  await done(page, 'toast');

  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await page.locator('#btn-hover-tooltip').hover();
  const tip = await page.getByRole('tooltip').textContent();
  await page.getByTestId('answer-btn-hover-tooltip').fill(tip!.match(/TIP-\d+/)![0]);
  await done(page, 'btn-hover-tooltip');

  await expect(page.getByText('6 of 6 Tasks')).toBeVisible();
});
