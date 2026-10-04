import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const done = (page: import('@playwright/test').Page, id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'true');

test('every Advanced Inputs task ticks itself when solved', async ({ page }, info) => {
  await page.goto('/practice/advanced');
  await expect(page.getByText('0 of 12 Tasks')).toBeVisible();

  await page.locator('#dropdown-standard').selectOption('option2');
  await done(page, 'dropdown-standard');

  await page.locator('#dropdown-searchable').fill('Ind');
  await page.getByText('India', { exact: true }).click();
  await done(page, 'dropdown-searchable');

  await page.locator('#dropdown-multiple').selectOption(['banana', 'grape']);
  await done(page, 'dropdown-multiple');

  await expect(page.locator('#dropdown-disabled')).toBeDisabled();
  await page.getByTestId('answer-dropdown-disabled').fill((await page.locator('#dropdown-disabled option').textContent())!);
  await done(page, 'dropdown-disabled');

  await page.locator('#dropdown-country').selectOption('ca');
  await page.locator('#dropdown-state').selectOption('bc');
  await done(page, 'dropdown-cascading');

  await page.locator('#date-picker').fill('2030-08-15');
  await page.locator('#time-picker').fill('14:30');
  await page.locator('#datetime-picker').fill('2030-12-31T23:59');
  for (const id of ['date-picker', 'time-picker', 'datetime-picker']) await done(page, id);

  await page.locator('#file-upload-single').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('x') });
  await expect(page.getByTestId('upload-single-error')).toBeVisible();
  await expect(page.getByTestId('element-file-upload-single')).toHaveAttribute('data-done', 'false');
  await page.locator('#file-upload-single').setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: Buffer.from('x') });
  await done(page, 'file-upload-single');

  await page.locator('#file-upload-multiple').setInputFiles([
    { name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.from('a') },
    { name: 'b.txt', mimeType: 'text/plain', buffer: Buffer.from('b') },
  ]);
  await done(page, 'file-upload-multiple');

  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#download-csv').click()]);
  expect(dl.suggestedFilename()).toBe('order.csv');
  const csvPath = info.outputPath('order.csv');
  await dl.saveAs(csvPath);
  const total = fs.readFileSync(csvPath, 'utf8').trim().split('\n').pop()!.split(',')[1];
  await page.getByTestId('answer-download-csv').fill(total);
  await done(page, 'download-csv');

  await page.locator('#color-picker').fill('#22c55e');
  await done(page, 'color-picker');

  await expect(page.getByText('12 of 12 Tasks')).toBeVisible();
});

test('a wrong answer does not tick the task', async ({ page }) => {
  await page.goto('/practice/advanced');
  await page.getByTestId('answer-dropdown-disabled').fill('LOCK-0000X');
  await expect(page.getByTestId('element-dropdown-disabled')).toHaveAttribute('data-done', 'false');
});

test('the PDF download is a real PDF', async ({ page }, info) => {
  await page.goto('/practice/advanced');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#download-pdf').click()]);
  const p = info.outputPath('invoice.pdf');
  await dl.saveAs(p);
  expect(fs.readFileSync(p, 'utf8')).toMatch(/^%PDF-1\.4[\s\S]*%%EOF\n$/);
});

test('guide panels open from the info button, hint and code toggles', async ({ page }) => {
  await page.goto('/practice/advanced');
  const el = page.getByTestId('element-dropdown-standard');
  await expect(el.getByText('Should pass')).toBeHidden();
  await page.getByTestId('info-dropdown-standard').click();
  await expect(el.getByText('Should pass')).toBeVisible();
  await page.getByTestId('code-dropdown-standard').click();
  await expect(el.locator('pre')).toContainText("selectOption('option2')");
  await el.getByRole('tab', { name: 'Selenium Python' }).click();
  await expect(el.locator('pre')).toContainText('select_by_value');
});

test('Reset Page clears the page tasks', async ({ page }) => {
  await page.goto('/practice/advanced');
  await page.locator('#dropdown-standard').selectOption('option2');
  await done(page, 'dropdown-standard');
  await page.getByRole('button', { name: 'Reset Page' }).click();
  await page.waitForLoadState('load');
  await expect(page.getByTestId('element-dropdown-standard')).toHaveAttribute('data-done', 'false');
});
