import { test, expect, type Page, type Locator } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/practice/sortable');
  await expect(page.locator('main h1')).toBeVisible();
});

async function holdDrag(page: Page, source: Locator, target: Locator) {
  // page.mouse works in viewport coordinates and does not scroll for you.
  await source.scrollIntoViewIfNeeded();
  const s = (await source.boundingBox())!;
  const t = (await target.boundingBox())!;
  await page.mouse.move(s.x + s.width / 2, s.y + s.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(300);
  await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 10 });
  await page.mouse.up();
}

const texts = (l: Locator) => l.allInnerTexts().then((a) => a.map((t) => t.trim()));

test('sort the HTML5 list with dragTo', async ({ page }) => {
  const items = page.getByTestId('html5-item');
  const goal = ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'];
  for (let i = 0; i < goal.length; i++) {
    if ((await texts(items))[i] === goal[i]) continue;
    await items.filter({ hasText: goal[i] }).dragTo(items.nth(i));
  }
  expect(await texts(items)).toEqual(goal);
  await expect(page.getByTestId('result-html5')).toHaveAttribute('data-state', 'success');
});

test('a quick dragTo does not start the press-and-hold drag', async ({ page }) => {
  const items = page.getByTestId('hold-item');
  const before = await texts(items);
  await items.nth(0).dragTo(items.nth(3));
  expect(await texts(items)).toEqual(before);
});

test('holding long enough but jumping in one move does not drop', async ({ page }) => {
  const items = page.getByTestId('hold-item');
  await items.first().scrollIntoViewIfNeeded();
  const before = await texts(items);
  const s = (await items.nth(0).boundingBox())!;
  const t = (await items.nth(3).boundingBox())!;
  await page.mouse.move(s.x + s.width / 2, s.y + s.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(300);
  await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2);
  await page.mouse.up();
  expect(await texts(items)).toEqual(before);
});

test('sort the press-and-hold list', async ({ page }) => {
  const items = page.getByTestId('hold-item');
  const goal = ['A', 'B', 'C', 'D', 'E'];
  for (let i = 0; i < goal.length; i++) {
    if ((await texts(items))[i] === goal[i]) continue;
    await holdDrag(page, items.filter({ hasText: new RegExp(`^${goal[i]}$`) }), items.nth(i));
  }
  expect(await texts(items)).toEqual(goal);
  await expect(page.getByTestId('result-hold')).toHaveAttribute('data-state', 'success');
});

test('move kanban cards', async ({ page }) => {
  await page.getByTestId('card').filter({ hasText: 'Write tests' }).dragTo(page.locator('#col-done'));
  await page.getByTestId('card').filter({ hasText: 'Fix bug #42' }).dragTo(page.locator('#col-progress'));
  await expect(page.locator('#col-done')).toContainText('Write tests');
  await expect(page.getByTestId('result-kanban')).toHaveAttribute('data-state', 'success');
});

test('reset restores the start order', async ({ page }) => {
  const items = page.getByTestId('html5-item');
  const start = await texts(items);
  await items.nth(4).dragTo(items.nth(0));
  expect(await texts(items)).not.toEqual(start);
  await page.locator('#reset-html5').click();
  expect(await texts(items)).toEqual(start);
  await expect(page.getByTestId('result-html5')).toHaveAttribute('data-state', 'pending');
});

test('synthetic pointer events (as Cypress sends them) also sort the hold list', async ({ page }) => {
  const items = page.getByTestId('hold-item');
  await items.first().scrollIntoViewIfNeeded();
  const before = await texts(items);
  await items.nth(1).evaluate(async (target) => {
    const source = target.parentElement!.children[0] as HTMLElement;
    const fire = (el: Element, type: string) => {
      const r = el.getBoundingClientRect();
      el.dispatchEvent(new PointerEvent(type, { pointerId: 99, bubbles: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }));
    };
    fire(source, 'pointerdown');
    await new Promise((resolve) => setTimeout(resolve, 300));
    for (let i = 0; i < 3; i++) fire(target, 'pointermove');
    fire(target, 'pointerup');
  });
  expect(await texts(items)).toEqual([before[1], before[0], ...before.slice(2)]);
});
