import { test, expect, type Page } from '@playwright/test';
import { challenges } from '../src/data/challenges';
import seo from '../src/data/seo.json' with { type: 'json' };

const head = (page: Page) =>
  page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
    canonicalCount: document.querySelectorAll('link[rel="canonical"]').length,
    jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent || '{}')['@type']),
  }));

for (const c of challenges) {
  test(`${c.id}: own title, canonical, structured data and visible FAQ`, async ({ page }) => {
    const s = (seo as Record<string, { title: string; faqs: { q: string }[] }>)[c.id];
    await page.goto(`/practice/${c.id}`);
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page).toHaveTitle(s.title);
    const h = await head(page);
    expect(h.canonical).toMatch(new RegExp(`/practice/${c.id}$`));
    expect(h.canonicalCount).toBe(1);
    expect(h.robots).toBe('index, follow');
    expect(h.ogImage).toMatch(new RegExp(`/og/${c.id}\\.png$`));
    expect(h.jsonLd).toEqual(expect.arrayContaining(['BreadcrumbList', 'FAQPage']));
    const guide = page.getByTestId('page-guide');
    await expect(guide).toContainText(s.faqs[0].q);
    expect(await guide.locator('a[data-testid="related-link"]').count()).toBeGreaterThanOrEqual(2);
  });
}

test('navigating between pages swaps the head without duplicates', async ({ page }) => {
  await page.goto('/practice/basic');
  await expect(page.locator('main h1').first()).toBeVisible();
  await page.getByTestId('nav-tables').click();
  await expect(page).toHaveTitle((seo as Record<string, { title: string }>).tables.title);
  const h = await head(page);
  expect(h.canonical).toMatch(/\/practice\/tables$/);
  expect(h.canonicalCount).toBe(1);
  expect(h.jsonLd.filter((t) => t === 'FAQPage')).toHaveLength(1);
});

test('store pages are noindex', async ({ page }) => {
  await page.goto('/cart');
  await expect.poll(async () => (await head(page)).robots).toBe('noindex, follow');
});

test('an old hash link lands on the clean URL', async ({ page }) => {
  await page.goto('/#/practice/tables');
  await expect(page).toHaveURL(/\/practice\/tables$/);
  await expect(page.locator('main h1').first()).toBeVisible();
});

test('the hub links out to Randomly.online', async ({ page }) => {
  await page.goto('/practice');
  await expect(page.getByTestId('page-guide').locator('a[href^="https://randomly.online"]').first()).toBeVisible();
});
