import { test, expect } from '@playwright/test';
import { practiceChallenges } from '../src/data/challenges';

test('locked until every challenge is complete', async ({ page }) => {
  await page.goto('/practice/certificate');
  await expect(page.locator('#cert-locked')).toBeVisible();
  await expect(page.locator('#remaining-list li')).toHaveCount(practiceChallenges.length);
});

test('generates and downloads once complete', async ({ page }) => {
  const ids = practiceChallenges.map((c) => c.id);
  await page.addInitScript((ids) => {
    const totals = Object.fromEntries(ids.map((id) => [id, { main: 1 }]));
    const completed = Object.fromEntries(ids.map((id) => [id, ['main:0']]));
    localStorage.setItem('qa-playground-progress-v3', JSON.stringify({ state: { totals, completed }, version: 0 }));
  }, ids);
  await page.goto('/practice/certificate');
  await page.locator('#cert-name').fill('Ada Lovelace');
  await page.locator('#generate-cert').click();
  await expect(page.locator('#certificate')).toContainText('Ada Lovelace');
  const download = page.waitForEvent('download');
  await page.locator('#download-cert').click();
  expect((await download).suggestedFilename()).toBe('qa-certificate.png');
});
