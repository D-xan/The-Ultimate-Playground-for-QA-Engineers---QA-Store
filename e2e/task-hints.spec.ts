import { test, expect } from '@playwright/test';

// Every practice page: each element has a goal, test cases, a hint and code behind buttons, hidden until asked for.
const PAGES = ['basic', 'advanced', 'tables', 'interactions', 'dialogs', 'frames', 'dynamic', 'pagination-test', 'lazy-load',
  'api-interception', 'progress-bar', 'click-traps', 'locator-traps', 'deep-dom', 'flaky', 'widgets', 'bug-hunt', 'windows',
  'sortable', 'virtual-table', 'auth-flows', 'canvas', 'a11y'];

for (const id of PAGES) {
  test(`${id}: every element has its guide behind buttons`, async ({ page }) => {
    await page.goto(`/practice/${id}`);
    const elements = page.locator('[data-testid^="element-"]');
    await expect(elements.first()).toBeVisible();
    const count = await elements.count();
    await expect(page.getByText(`0 of ${count} Tasks`)).toBeVisible();
    for (let i = 0; i < count; i++) {
      const el = elements.nth(i);
      const elId = (await el.getAttribute('data-testid'))!.replace('element-', '');
      const hint = el.getByTestId(`hint-${elId}`);
      await expect(el.getByText('Should pass')).toBeHidden();
      await hint.click();
      await expect(hint).toHaveAttribute('aria-expanded', 'true');
      await el.getByTestId(`code-${elId}`).click();
      await expect(el.locator('pre code')).not.toBeEmpty();
      await el.getByTestId(`info-${elId}`).click();
      await expect(el.getByText('Should pass')).toBeVisible();
    }
  });
}
