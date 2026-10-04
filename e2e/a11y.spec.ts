import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PLANTED } from '../src/data/a11yRules';

test.beforeEach(async ({ page }) => {
  await page.goto('/practice/a11y');
  await expect(page.locator('main h1')).toBeVisible();
});

// Bring the region on screen first: axe skips the contrast check for text it cannot see
// (here, text below the fold or under the page's sticky bottom bar).
const scan = async (page: Page, selector: string) => {
  await page.locator(selector).evaluate((el) => el.scrollIntoView({ block: 'center' }));
  return new AxeBuilder({ page }).include(selector).withTags(['wcag2a', 'wcag2aa']).analyze();
};

test('the broken form has exactly the planted violations', async ({ page }) => {
  const { violations } = await scan(page, '#a11y-broken');
  expect(violations.map((v) => v.id).sort()).toEqual([...PLANTED].sort());
  for (const id of PLANTED) await page.locator(`#rule-${id}`).check();
  await page.locator('#check-a11y').click();
  await expect(page.getByTestId('result-axe')).toHaveAttribute('data-state', 'success');
});

test('ticking a decoy fails', async ({ page }) => {
  for (const id of PLANTED) await page.locator(`#rule-${id}`).check();
  await page.locator('#rule-heading-order').check();
  await page.locator('#check-a11y').click();
  await expect(page.getByTestId('result-axe')).toHaveAttribute('data-state', 'failure');
});

test('the fixed form has no violations', async ({ page }) => {
  const { violations } = await scan(page, '#a11y-fixed');
  expect(violations).toEqual([]);
});

const focusedInDialog = (page: Page) =>
  page.evaluate(() => !!document.activeElement?.closest('#kb-dialog'));

test('complete the form with only the keyboard', async ({ page }) => {
  await page.locator('#kb-name').focus();
  await page.keyboard.type('Ada');
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#kb-tool [aria-selected="true"]')).toHaveText('Cypress');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('#kb-dialog')).toBeVisible();
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Tab');
    expect(await focusedInDialog(page)).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('#kb-dialog')).toBeHidden();
  await expect(page.locator('#kb-submit')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#kb-confirm')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('result-keyboard')).toHaveAttribute('data-state', 'success');
});

test('using the mouse fails the keyboard challenge', async ({ page }) => {
  await page.locator('#kb-name').click();
  await expect(page.locator('#keyboard-form')).toHaveAttribute('data-mouse-used', 'true');
  await page.keyboard.type('Ada');
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('result-keyboard')).toHaveAttribute('data-state', 'failure');
});

test('each solved part ticks its own task', async ({ page }) => {
  const done = (id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'true');
  await expect(page.getByText('0 of 3 Tasks')).toBeVisible();
  const { violations } = await scan(page, '#a11y-broken');
  for (const v of violations) await page.locator(`#rule-${v.id}`).check();
  await page.locator('#check-a11y').click();
  await done('axe');
  // axe is now in the page, which is what the fixed-form task listens for
  expect((await scan(page, '#a11y-fixed')).violations).toEqual([]);
  await done('fixed');
  await page.locator('#kb-name').focus();
  await page.keyboard.type('Ada');
  for (const key of ['Tab', 'ArrowDown', 'ArrowDown', 'Tab', 'Space', 'Tab', 'Enter']) await page.keyboard.press(key);
  await expect(page.locator('#kb-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Enter');
  await expect(page.locator('#kb-confirm')).toBeFocused();
  await page.keyboard.press('Enter');
  await done('keyboard');
  await expect(page.getByText('3 of 3 Tasks')).toBeVisible();
});
