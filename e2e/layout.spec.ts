import { test, expect } from '@playwright/test';
import { challenges } from '../src/data/challenges';

for (const c of challenges) {
  test(`${c.id}: numbered sections run 1..n`, async ({ page }) => {
    await page.goto(`/#/practice/${c.id}`);
    await expect(page.locator('main h1').first()).toBeVisible();
    const texts = await page.locator('main h2').allInnerTexts();
    const nums = texts.map((t) => t.match(/^(\d+)\.\s/)?.[1]).filter(Boolean).map(Number);
    expect(nums).toEqual(nums.map((_, i) => i + 1));
  });
}

test('dashboard has no horizontal scroll on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/#/practice');
  await expect(page.getByTestId('challenge-card-basic')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
