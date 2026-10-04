import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/practice/locator-traps');
});

test('dynamic id button is found by its text', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Dynamic ID Button' });
  const firstId = await button.getAttribute('id');
  await button.click();
  await expect(page.getByTestId('result-dynamic-id')).toHaveAttribute('data-state', 'success');
  await expect(button).not.toHaveAttribute('id', firstId!);
});

test('primary button is found by class, whatever the class order', async ({ page }) => {
  await page.locator('#class-trap .btn-primary').click();
  await expect(page.getByTestId('result-class-attr')).toHaveAttribute('data-state', 'success');
});

test('text with a non-breaking space defeats exact XPath text()', async ({ page }) => {
  expect(await page.locator("xpath=//div[@id='nbsp-section']//button[text()='Click Me']").count()).toBe(0);
  await page.locator('#nbsp-section button', { hasText: /Click\s+Me/ }).click();
  await expect(page.getByTestId('result-nbsp')).toHaveAttribute('data-state', 'success');
});

test('shifting menu is clicked by name, not position', async ({ page }) => {
  await page.locator('#shift-button').click();
  await page.locator('#shifting-menu').getByRole('button', { name: 'Gallery' }).click();
  await expect(page.getByTestId('result-shifting')).toHaveAttribute('data-state', 'success');
});

test('each solved trap ticks its own task', async ({ page }) => {
  const done = (id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'true');
  await expect(page.getByText('0 of 4 Tasks')).toBeVisible();
  await page.getByRole('button', { name: 'Dynamic ID Button' }).click();
  await done('dynamic-id');
  await page.locator('#class-trap .btn-primary').click();
  await done('class-attr');
  await page.locator("xpath=//div[@id='nbsp-section']//button[normalize-space(translate(., ' ', ' '))='Click Me']").click();
  await done('nbsp');
  await page.locator('#shift-button').click();
  await page.locator('#shifting-menu').getByRole('button', { name: 'Gallery' }).click();
  await done('shifting');
  await expect(page.getByText('4 of 4 Tasks')).toBeVisible();
});
