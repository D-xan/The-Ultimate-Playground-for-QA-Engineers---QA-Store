import { test, expect, type Page } from '@playwright/test';

const done = (page: Page, id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'true');
const notDone = (page: Page, id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'false');

test('every Frames & Shadow DOM task ticks itself when solved', async ({ page }) => {
  await page.goto('/practice/frames');
  await expect(page.getByText('0 of 5 Tasks')).toBeVisible();

  await page.locator('#btn-main-confirm').click();
  await notDone(page, 'frame-back'); // the frame task comes first

  const frame = page.frameLocator('#practice-iframe');
  await frame.locator('#frame-input').fill('ACCESS-0000');
  await frame.locator('#frame-submit').click();
  await expect(frame.locator('#frame-status')).toHaveText('Wrong code');
  await notDone(page, 'practice-iframe');
  const accessCode = await page.locator('#access-code').textContent();
  await frame.locator('#frame-input').fill(accessCode!);
  await frame.locator('#frame-submit').click();
  await expect(frame.locator('#frame-status')).toHaveText('Code accepted');
  await done(page, 'practice-iframe');

  await page.locator('#btn-main-confirm').click();
  await done(page, 'frame-back');

  const inner = page.frameLocator('#outer-frame').frameLocator('#inner-frame');
  await page.getByTestId('answer-nested-iframe').fill((await inner.locator('#inner-code').textContent())!);
  await done(page, 'nested-iframe');

  await page.locator('#shadow-host #shadow-btn').click();
  await expect(page.locator('#shadow-status')).toHaveText('Shadow button clicked');
  await done(page, 'shadow-host');

  await page.getByTestId('answer-nested-shadow').fill((await page.locator('#nested-shadow-host #nested-code').textContent())!);
  await done(page, 'nested-shadow');

  await expect(page.getByText('5 of 5 Tasks')).toBeVisible();
});
