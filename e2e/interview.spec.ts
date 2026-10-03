import { test, expect } from '@playwright/test';

test('filtering by topic shows only that topic', async ({ page }) => {
  await page.goto('/#/practice/interview');
  await page.getByTestId('topic-playwright').click();
  const topics = await page.getByTestId('question').evaluateAll((els) => els.map((e) => e.getAttribute('data-topic')));
  expect(topics.length).toBeGreaterThanOrEqual(8);
  expect(new Set(topics)).toEqual(new Set(['Playwright']));
});

test('flashcard progress persists across reloads', async ({ page }) => {
  await page.goto('/#/practice/interview');
  await page.locator('#flashcard-mode').click();
  await page.locator('#show-answer').click();
  await expect(page.locator('#flashcard-answer')).toBeVisible();
  await page.locator('#mark-known').click();
  await expect(page.locator('#known-count')).toContainText('1 /');
  await page.reload();
  await expect(page.locator('#known-count')).toContainText('1 /');
});
