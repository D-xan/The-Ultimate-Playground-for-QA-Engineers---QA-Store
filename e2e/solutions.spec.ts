import { test, expect } from '@playwright/test';

for (const id of ['click-traps', 'locator-traps', 'deep-dom', 'flaky', 'widgets', 'progress-bar', 'windows']) {
  test(`${id} shows four solutions after reveal`, async ({ page }) => {
    await page.goto(`/#/practice/${id}`);
    await expect(page.getByRole('tab', { name: 'Playwright' })).toHaveCount(0);
    await page.locator('#reveal-solution').click();
    await expect(page.getByRole('tabpanel')).toContainText('@playwright/test');
    await page.getByRole('tab', { name: 'Selenium Java' }).click();
    await expect(page.getByRole('tabpanel')).toContainText('driver.findElement');
    await page.getByRole('tab', { name: 'Selenium Python' }).click();
    await expect(page.getByRole('tabpanel')).toContainText('find_element');
    await page.getByRole('tab', { name: 'Cypress' }).click();
    await expect(page.getByRole('tabpanel')).toContainText('cy.visit');
  });
}
