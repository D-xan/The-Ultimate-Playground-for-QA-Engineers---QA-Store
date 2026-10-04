import { test, expect, type Page } from '@playwright/test';
import { challenges } from '../src/data/challenges';

for (const c of challenges) {
  test(`${c.id}: numbered sections run 1..n`, async ({ page }) => {
    await page.goto(`/practice/${c.id}`);
    await expect(page.locator('main h1').first()).toBeVisible();
    const texts = await page.locator('main h2').allInnerTexts();
    const nums = texts.map((t) => t.match(/^(\d+)\s*\.\s*/)?.[1]).filter(Boolean).map(Number);
    expect(nums).toEqual(nums.map((_, i) => i + 1));
  });
}

/**
 * Real phone-width overflow check. The practice layout is h-screen overflow-hidden and scrolls in an inner
 * overflow-y-auto wrapper, so document scrollWidth can never overflow. Instead measure inside <main>:
 * - the content wrapper (and any overflow-x auto/scroll container) must not scroll horizontally
 * - no visible element may extend past the viewport (elements clipped by an overflow ancestor and
 *   position:fixed overlays are excluded)
 */
const findOverflow = () => {
  const main = document.querySelector('main')!;
  const problems: string[] = [];
  const name = (el: Element) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${String(el.className).slice(0, 40)}`;
  const fixed = (el: Element) => {
    for (let n: Element | null = el; n && n !== document.body; n = n.parentElement) {
      if (getComputedStyle(n).position === 'fixed') return true;
    }
    return false;
  };
  const wrapper = main.querySelector(':scope > div.overflow-y-auto');
  // The page wrapper must never scroll sideways. Inner overflow-x auto/scroll containers (wide
  // tables) are deliberate local scrollers: they must fit the viewport themselves, but their contents are clipped.
  if (wrapper && wrapper.scrollWidth - wrapper.clientWidth > 0) {
    problems.push(`scrolls horizontally: ${name(wrapper)} (${wrapper.scrollWidth} > ${wrapper.clientWidth})`);
  }
  const clipped = (el: Element) => {
    for (let n = el.parentElement; n && n !== main && n !== wrapper; n = n.parentElement) {
      if (['auto', 'scroll'].includes(getComputedStyle(n).overflowX)) return true;
    }
    return false;
  };
  for (const el of main.querySelectorAll('*')) {
    if (fixed(el) || clipped(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (r.right > window.innerWidth + 1) problems.push(`extends past viewport: ${name(el)} (right ${Math.round(r.right)})`);
  }
  return problems;
};

const expectNoOverflow = async (page: Page) => {
  expect(await page.evaluate(findOverflow)).toEqual([]);
};

test('dashboard has no horizontal scroll on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/practice');
  await expect(page.getByTestId('challenge-card-basic')).toBeVisible();
  await expectNoOverflow(page);
});

for (const c of challenges) {
  test(`${c.id}: no horizontal scroll on a phone`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/practice/${c.id}`);
    await expect(page.locator('main h1').first()).toBeVisible();
    await expectNoOverflow(page);
  });
}

test('overflow check can fail (guard)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/practice/basic');
  await expect(page.locator('main h1').first()).toBeVisible();
  await page.evaluate(() => {
    const d = document.createElement('div');
    d.style.cssText = 'width:600px;height:10px';
    document.querySelector('main h1')!.parentElement!.appendChild(d);
  });
  expect((await page.evaluate(findOverflow)).length).toBeGreaterThan(0);
});
