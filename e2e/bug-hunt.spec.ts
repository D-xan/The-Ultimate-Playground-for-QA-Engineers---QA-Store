import { test, expect, type Page } from '@playwright/test';

const PRODUCT_ID = '9246ef39-d674-45d2-8160-f05b996e3d88';
const money = (text: string | null) => Number((text ?? '').replace(/[^0-9.]/g, ''));

async function cartSubtotalWithQty2(page: Page): Promise<{ subtotal: number; unit: number }> {
  // Add one product to the cart with quantity 2 using the store UI, open the cart,
  // and return the displayed subtotal and unit price as numbers.
  await page.goto(`/#/product/${PRODUCT_ID}`);
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  await page.goto('/#/cart');
  const line = page.getByTestId(`cart-item-${PRODUCT_ID}`);
  await line.getByTestId('cart-qty-increase').click();
  await expect(line.getByTestId('cart-qty')).toHaveText('2');
  const unit = money(await line.getByTestId('cart-unit-price').textContent());
  const subtotal = money(await page.getByTestId('cart-subtotal').textContent());
  return { subtotal, unit };
}

test('bug hunt off: cart subtotal is price × quantity', async ({ page }) => {
  const { subtotal, unit } = await cartSubtotalWithQty2(page);
  expect(subtotal).toBeCloseTo(unit * 2, 2);
});

test('bug hunt on: subtotal bug appears and can be reported', async ({ page }) => {
  await page.goto('/#/practice/bug-hunt');
  await page.locator('#bug-hunt-toggle').check();
  const { subtotal, unit } = await cartSubtotalWithQty2(page);
  expect(subtotal).toBeCloseTo(unit, 2);
  await page.goto('/#/practice/bug-hunt');
  await page.locator('#bug-area').selectOption('Cart');
  await page.locator('#bug-symptom').selectOption({ label: 'Subtotal ignores the quantity of the last item' });
  await page.locator('#report-bug').click();
  await expect(page.getByTestId('result-report')).toHaveAttribute('data-state', 'success');
  await expect(page.locator('#bugs-found')).toHaveText('1 / 6 found');
});

test('bug hunt banner is visible in the store and can turn the mode off', async ({ page }) => {
  await page.goto('/#/practice/bug-hunt');
  await page.locator('#bug-hunt-toggle').check();
  await page.goto('/#/');
  await expect(page.getByTestId('bug-hunt-banner')).toBeVisible();
  await page.locator('#bug-hunt-banner-off').click();
  await expect(page.getByTestId('bug-hunt-banner')).toHaveCount(0);
  const { subtotal, unit } = await cartSubtotalWithQty2(page);
  expect(subtotal).toBeCloseTo(unit * 2, 2);
});

test('Reset All turns bug hunt off', async ({ page }) => {
  await page.goto('/#/practice/bug-hunt');
  await page.locator('#bug-hunt-toggle').check();
  await page.getByRole('button', { name: 'Reset All' }).click();
  await page.waitForLoadState('load');
  await page.goto('/#/');
  await expect(page.getByTestId('bug-hunt-banner')).toHaveCount(0);
  await expect(page.getByTestId('bug-hunt-banner')).toHaveCount(0);
  await page.goto('/#/practice/bug-hunt');
  await expect(page.locator('#bug-hunt-toggle')).not.toBeChecked();
});

test('saved page state does not desync the bug hunt toggle', async ({ page }) => {
  await page.goto('/#/practice/bug-hunt');
  await page.locator('#bug-hunt-toggle').check();
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.locator('#bug-hunt-toggle').uncheck();
  await page.reload();
  await page.waitForTimeout(500);
  await expect(page.locator('#bug-hunt-toggle')).not.toBeChecked();
  await expect(page.getByText('Bug Hunt mode off')).toBeVisible();
});
