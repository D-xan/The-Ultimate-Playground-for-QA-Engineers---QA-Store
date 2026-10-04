import { test, expect, type Page } from '@playwright/test';

const done = (page: Page, id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'true');
const notDone = (page: Page, id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'false');

test('every API Interception task ticks itself when solved', async ({ page }) => {
  await page.goto('/practice/api-interception');
  await expect(page.getByText('0 of 4 Tasks')).toBeVisible();
  const send = page.locator('#api-send-btn');

  await page.route('**/posts/**', (r) => r.fulfill({ status: 200, json: { id: 1, title: 'real-looking post' } }));
  await send.click();
  await expect(page.locator('#api-status')).toContainText('200');
  await notDone(page, 'api-mock'); // a 200 without the agreed body does not count
  await page.unroute('**/posts/**');

  await page.route('**/posts/**', (r) => r.fulfill({ status: 200, json: { message: 'Intercepted!' } }));
  await send.click();
  await expect(page.locator('#api-response-body')).toContainText('Intercepted!');
  await done(page, 'api-mock');
  await page.unroute('**/posts/**');

  await page.route('**/posts/**', (r) => r.fulfill({ status: 404, body: 'Not found' }));
  await send.click();
  await expect(page.locator('#api-status')).toContainText('404');
  await notDone(page, 'api-errors');
  await page.unroute('**/posts/**');
  await page.route('**/posts/**', (r) => r.fulfill({ status: 500, body: 'Server error' }));
  await send.click();
  await expect(page.locator('#api-status')).toContainText('500');
  await done(page, 'api-errors');
  await page.unroute('**/posts/**');

  // Stand-in for jsonplaceholder: echo what arrives, so only the rewrite can produce admin.
  await page.route('**/posts', (r) => r.fulfill({ status: 201, json: { ...r.request().postDataJSON(), id: 101 } }));
  await page.locator('#api-method-select').selectOption('POST');
  await page.locator('#api-url-input').fill('https://jsonplaceholder.typicode.com/posts');
  await page.locator('#api-body-textarea').fill('{"role": "user"}');
  await send.click();
  await expect(page.locator('#api-response-body')).toContainText('"role": "user"');
  await notDone(page, 'api-mutate');
  await page.unroute('**/posts');
  await page.route('**/posts', async (route) => {
    const body = { ...route.request().postDataJSON(), role: 'admin' };
    await route.fulfill({ status: 201, json: { ...body, id: 101 } });
  });
  await send.click();
  await expect(page.locator('#api-response-body')).toContainText('"role": "admin"');
  await done(page, 'api-mutate');
  await page.unroute('**/posts');

  await page.route('**/posts', (route) => route.abort('internetdisconnected'));
  await send.click();
  await expect(page.locator('#api-status-error')).toHaveText('Network Error');
  await done(page, 'api-abort');

  await expect(page.getByText('4 of 4 Tasks')).toBeVisible();
});
