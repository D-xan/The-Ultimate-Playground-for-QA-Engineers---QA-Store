import { test, expect } from '@playwright/test';
import { practiceChallenges } from '../src/data/challenges';

test('locked until every challenge is passed', async ({ page }) => {
  await page.goto('/practice/completion-badge');
  await expect(page.locator('#badge-locked')).toBeVisible();
  await expect(page.locator('#challenge-grid li[data-status="pending"]')).toHaveCount(practiceChallenges.length);
  await expect(page.locator('#badge-preview')).toHaveAttribute('aria-label', new RegExp(`0 of ${practiceChallenges.length} challenges passed`));
  await expect(page.locator('#download-badge')).toHaveCount(0);
});

test('previews and downloads once every challenge is passed', async ({ page }) => {
  const ids = practiceChallenges.map((c) => c.id);
  await page.addInitScript((ids) => {
    const totals = Object.fromEntries(ids.map((id) => [id, { main: 1 }]));
    const completed = Object.fromEntries(ids.map((id) => [id, ['main:0']]));
    localStorage.setItem('qa-playground-progress-v3', JSON.stringify({ state: { totals, completed }, version: 0 }));
  }, ids);
  await page.goto('/practice/completion-badge');
  await expect(page.locator('#challenge-grid li[data-status="passed"]')).toHaveCount(ids.length);
  await expect(page.locator('#download-badge')).toBeDisabled();
  await page.locator('#badge-name').fill('Ada Lovelace');
  await expect(page.locator('#badge-preview')).toHaveAttribute('aria-label', /Ada Lovelace/);
  const download = page.waitForEvent('download');
  await page.locator('#download-badge').click();
  expect((await download).suggestedFilename()).toBe('qa-playground-badge.png');
  await expect(page.locator('#share-linkedin')).toHaveAttribute('href', /linkedin\.com\/feed\/\?shareActive=true/);
});
