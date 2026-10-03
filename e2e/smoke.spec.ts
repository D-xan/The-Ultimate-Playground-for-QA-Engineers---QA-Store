import { test, expect } from '@playwright/test';
import { challenges } from '../src/data/challenges';

test('dashboard lists every challenge', async ({ page }) => {
  await page.goto('/practice');
  for (const c of challenges) {
    const prefix = c.kind === 'tool' ? 'tool-card' : 'challenge-card';
    await expect(page.getByTestId(`${prefix}-${c.id}`)).toBeVisible();
  }
});

for (const c of challenges) {
  test(`deep link renders ${c.id}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`/practice/${c.id}`);
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.getByTestId(`nav-${c.id}`)).toHaveAttribute('aria-current', 'page');
    expect(errors).toEqual([]);
  });
}
