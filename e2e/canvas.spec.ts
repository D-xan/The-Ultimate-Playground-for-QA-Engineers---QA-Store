import { test, expect, type Locator } from '@playwright/test';

// Centre the canvas: scrolled only to the edge, part of it sits under the page's sticky bottom bar.
const centre = (canvas: Locator) => canvas.evaluate((el) => el.scrollIntoView({ block: 'center' }));

test.beforeEach(async ({ page }) => {
  await page.goto('/practice/canvas');
  await expect(page.locator('main h1')).toBeVisible();
});

test('hit the moving target three times', async ({ page }) => {
  const canvas = page.locator('#target-canvas');
  await centre(canvas);
  for (let i = 0; i < 3; i++) {
    const box = (await canvas.boundingBox())!;
    const t = await page.evaluate(() => (window as unknown as { qaCanvas: { target(): { x: number; y: number } } }).qaCanvas.target());
    await page.mouse.click(box.x + t.x, box.y + t.y);
  }
  await expect(page.locator('#canvas-hits')).toHaveText('3');
  await expect(page.getByTestId('result-target')).toHaveAttribute('data-state', 'success');
});

test('draw a line from box to box', async ({ page }) => {
  const canvas = page.locator('#draw-canvas');
  await centre(canvas);
  const b = (await canvas.boundingBox())!;
  await page.mouse.move(b.x + b.width * 0.1, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * 0.9, b.y + b.height / 2, { steps: 20 });
  await page.mouse.up();
  await expect(page.getByTestId('result-draw')).toHaveAttribute('data-state', 'success');
});

test('a jump with no steps in between is not a stroke', async ({ page }) => {
  const canvas = page.locator('#draw-canvas');
  await centre(canvas);
  const b = (await canvas.boundingBox())!;
  await page.mouse.move(b.x + b.width * 0.1, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * 0.9, b.y + b.height / 2);
  await page.mouse.up();
  await expect(page.getByTestId('result-draw')).toHaveAttribute('data-state', 'failure');
});

test('find the peak month from the tooltips', async ({ page }) => {
  const bars = page.locator('#sales-chart [data-month]');
  let best = { month: '', value: -1 };
  for (let i = 0; i < (await bars.count()); i++) {
    const month = (await bars.nth(i).getAttribute('data-month'))!;
    await bars.nth(i).hover();
    const tip = page.locator('#chart-tooltip');
    await expect(tip).toContainText(month);
    const value = Number((await tip.innerText()).replace(/\D/g, ''));
    if (value > best.value) best = { month, value };
  }
  await page.locator('#peak-month').fill(best.month);
  await page.locator('#check-peak').click();
  await expect(page.getByTestId('result-chart')).toHaveAttribute('data-state', 'success');
});

test('synthetic pointer events (as Cypress sends them) also draw', async ({ page }) => {
  await page.locator('#draw-canvas').evaluate((el) => {
    const r = el.getBoundingClientRect();
    const fire = (type: string, fx: number) =>
      el.dispatchEvent(new PointerEvent(type, { pointerId: 99, bubbles: true, clientX: r.left + r.width * fx, clientY: r.top + r.height / 2 }));
    fire('pointerdown', 0.1);
    for (let i = 1; i <= 8; i++) fire('pointermove', 0.1 + 0.1 * i);
    fire('pointerup', 0.9);
  });
  await expect(page.getByTestId('result-draw')).toHaveAttribute('data-state', 'success');
});

test('each solved canvas task ticks its own element', async ({ page }) => {
  const done = (id: string) => expect(page.getByTestId(`element-${id}`)).toHaveAttribute('data-done', 'true');
  await expect(page.getByText('0 of 3 Tasks')).toBeVisible();
  const target = page.locator('#target-canvas');
  await centre(target);
  for (let i = 0; i < 3; i++) {
    const box = (await target.boundingBox())!;
    const t = await page.evaluate(() => (window as unknown as { qaCanvas: { target(): { x: number; y: number } } }).qaCanvas.target());
    await page.mouse.click(box.x + t.x, box.y + t.y);
  }
  await done('target');
  const canvas = page.locator('#draw-canvas');
  await centre(canvas);
  const b = (await canvas.boundingBox())!;
  await page.mouse.move(b.x + b.width * 0.1, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * 0.9, b.y + b.height / 2, { steps: 20 });
  await page.mouse.up();
  await done('draw');
  const bars = page.locator('#sales-chart [data-month]');
  let best = { month: '', value: -1 };
  for (let i = 0; i < (await bars.count()); i++) {
    const month = (await bars.nth(i).getAttribute('data-month'))!;
    await bars.nth(i).hover();
    await expect(page.locator('#chart-tooltip')).toContainText(month);
    const value = Number((await page.locator('#chart-tooltip').innerText()).replace(/\D/g, ''));
    if (value > best.value) best = { month, value };
  }
  await page.locator('#peak-month').fill(best.month);
  await page.locator('#check-peak').click();
  await done('chart');
  await expect(page.getByText('3 of 3 Tasks')).toBeVisible();
});
