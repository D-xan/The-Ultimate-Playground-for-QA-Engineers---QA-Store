import { test, expect } from '@playwright/test';

test('CSS selector highlights matches', async ({ page }) => {
  await page.goto('/#/practice/progress-bar');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('#start-button');
  await expect(page.locator('#selector-count')).toHaveText('1 match');
  await expect(page.locator('#start-button')).toHaveAttribute('data-selector-lab-match', '');
  await expect(page.locator('#selector-kind')).toHaveText('CSS');
});

test('XPath is detected and counted', async ({ page }) => {
  await page.goto('/#/practice/progress-bar');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('//h1');
  await expect(page.locator('#selector-kind')).toHaveText('XPath');
  await expect(page.locator('#selector-count')).toHaveText('1 match');
});

test('invalid selector shows an error', async ({ page }) => {
  await page.goto('/#/practice/progress-bar');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('##nope');
  await expect(page.locator('#selector-error')).toBeVisible();
});

test('pierces open shadow DOM inside iframes only when enabled', async ({ page }) => {
  await page.goto('/#/practice/deep-dom');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('#shadow-frame-button');
  await expect(page.locator('#selector-count')).toHaveText('1 match');
  await page.locator('#include-frames').uncheck();
  await expect(page.locator('#selector-count')).toHaveText('0 matches');
});

test('closing the lab removes highlights', async ({ page }) => {
  await page.goto('/#/practice/progress-bar');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('button');
  await expect(page.locator('[data-selector-lab-match]').first()).toBeAttached();
  await page.locator('#selector-lab-toggle').click();
  await expect(page.locator('[data-selector-lab-match]')).toHaveCount(0);
});

test('own toggle and panel are excluded from results', async ({ page }) => {
  await page.goto('/#/practice/progress-bar');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('button');
  await expect(page.locator('#start-button')).toHaveAttribute('data-selector-lab-match', '');
  await expect(page.locator('#selector-lab-toggle')).not.toHaveAttribute('data-selector-lab-match', '');
  const expected = await page.locator('main button:not(#selector-lab-toggle)').count()
    - await page.locator('[data-testid="selector-lab"] button').count();
  await expect(page.locator('#selector-count')).toHaveText(`${expected} matches`);
});

test('shadow-in-frame match gets a visible outline', async ({ page }) => {
  await page.goto('/#/practice/deep-dom');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('#shadow-frame-button');
  await expect(page.locator('#selector-count')).toHaveText('1 match');
  const style = await page.frameLocator('#shadow-frame').locator('#shadow-frame-button').evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(style).not.toBe('none');
});

test('pierce shadow off hides shadow matches', async ({ page }) => {
  await page.goto('/#/practice/deep-dom');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('#shadow-frame-button');
  await expect(page.locator('#selector-count')).toHaveText('1 match');
  await page.locator('#pierce-shadow').uncheck();
  await expect(page.locator('#selector-count')).toHaveText('0 matches');
});

test('XPath is scoped to frame bodies', async ({ page }) => {
  await page.goto('/#/practice/deep-dom');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('//button[@id="deep-button"]');
  await expect(page.locator('#selector-count')).toHaveText('1 match');
  await page.locator('#selector-input').fill('//html');
  await expect(page.locator('#selector-count')).toHaveText('0 matches');
  await page.waitForTimeout(500);
  await expect(page.locator('#selector-count')).toHaveText('0 matches');
});

test('finds elements in nested frames', async ({ page }) => {
  await page.goto('/#/practice/deep-dom');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('#deep-button');
  await expect(page.locator('#selector-count')).toHaveText('1 match');
});

test('route change leaves no stale highlights', async ({ page }) => {
  await page.goto('/#/practice/progress-bar');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('button');
  await expect(page.locator('[data-selector-lab-match]').first()).toBeAttached();
  await page.locator('[data-testid="nav-click-traps"]').click();
  await expect(page.locator('#start-button')).toHaveCount(0);
  await expect(page.locator('h1')).toBeVisible();
  // old page's elements are gone; any marker must belong to a button on the new page
  await expect(page.locator('[data-selector-lab-match]:not(button)')).toHaveCount(0);
  await expect(page.locator('#selector-lab-toggle')).not.toHaveAttribute('data-selector-lab-match', '');
});

test('closing the lab removes highlights even when a frame reloads afterwards', async ({ page }) => {
  await page.goto('/#/practice/deep-dom');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('button');
  await expect(page.locator('#selector-count')).not.toHaveText('0 matches');
  await page.locator('#selector-lab-toggle').click();
  await expect(page.getByTestId('selector-lab')).toHaveCount(0);
  await page.evaluate(() => {
    const f = document.querySelector<HTMLIFrameElement>('#countdown-frame')!;
    f.srcdoc = '<button id="again">again</button>';
  });
  await page.waitForTimeout(800);
  const leaked = await page.evaluate(() => {
    const sel = '[data-selector-lab-match]';
    let n = document.querySelectorAll(sel).length;
    const walk = (doc: Document) => doc.querySelectorAll('iframe').forEach((f) => {
      try { const d = f.contentDocument; if (d) { n += d.querySelectorAll(sel).length; walk(d); } } catch { /* cross-origin */ }
    });
    walk(document);
    return n;
  });
  expect(leaked).toBe(0);
});
