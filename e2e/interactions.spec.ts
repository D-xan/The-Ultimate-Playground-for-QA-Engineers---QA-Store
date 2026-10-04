import { test, expect, type Page } from '@playwright/test';

const done = (page: Page, id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'true');
const notDone = (page: Page, id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'false');

test('every Interactions task ticks itself when solved', async ({ page }) => {
  await page.goto('/practice/interactions');
  await expect(page.getByText('0 of 5 Tasks')).toBeVisible();

  await page.locator('#box-double-click').click();
  await expect(page.getByTestId('single-click-count')).toHaveText('Single clicks so far: 1');
  await notDone(page, 'box-double-click');
  await page.locator('#box-double-click').dblclick();
  await expect(page.locator('#box-double-click')).toHaveText('Double Click Successful!');
  await done(page, 'box-double-click');

  await page.locator('#box-right-click').click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await notDone(page, 'box-right-click');
  await page.locator('#box-right-click').click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Copy link' }).click();
  await done(page, 'box-right-click');

  await expect(page.locator('#hover-reveal-btn')).toBeHidden();
  await page.locator('#box-hover').hover();
  await page.locator('#hover-reveal-btn').click();
  await done(page, 'box-hover');

  await page.locator('#draggable-item').dragTo(page.locator('#droppable-zone'));
  await expect(page.locator('#droppable-zone')).toHaveText('Dropped!');
  await done(page, 'drag-drop');

  await page.locator('#keyboard-input').press('K');
  await notDone(page, 'keyboard-input');
  await page.locator('#keyboard-input').press('Control+Shift+K');
  await expect(page.locator('#key-output')).toContainText('Ctrl+Shift');
  await done(page, 'keyboard-input');

  await expect(page.getByText('5 of 5 Tasks')).toBeVisible();
});
