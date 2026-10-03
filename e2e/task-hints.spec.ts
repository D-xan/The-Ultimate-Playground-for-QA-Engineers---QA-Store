import { test, expect } from '@playwright/test';

// Pages whose tasks each carry their own hint, hidden until asked for.
const PAGES = ['windows', 'sortable', 'virtual-table', 'auth-flows', 'canvas', 'a11y'];

for (const id of PAGES) {
  test(`${id}: every task has a hint behind a button`, async ({ page }) => {
    await page.goto(`/#/practice/${id}`);
    await expect(page.locator('main h1')).toBeVisible();
    const expanders = page.locator('[data-testid^="task-expand-"]');
    const count = await expanders.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const testId = (await expanders.nth(i).getAttribute('data-testid'))!.replace('task-expand-', '');
      await expanders.nth(i).click();
      await expect(page.getByTestId(`task-hint-${testId}`)).toHaveCount(0);
      await page.getByTestId(`show-hint-${testId}`).click();
      await expect(page.getByTestId(`task-hint-${testId}`)).not.toBeEmpty();
    }
  });
}
