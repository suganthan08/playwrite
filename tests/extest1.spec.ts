import { test, expect } from '@playwright/test';

test('Checkbox test fix', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/');
  await page.waitForLoadState('domcontentloaded');

  // Navigate to checkbox page
  await page.click('text=Checkboxes');
  await page.waitForURL('**/checkboxes');
  await page.waitForSelector('input[type="checkbox"]'); // wait until visible

  const checkboxes = page.locator('input[type="checkbox"]');

  // Now safe to interact
  await checkboxes.first().check();
  expect(await checkboxes.first().isChecked()).toBeTruthy();

  await checkboxes.nth(1).uncheck();
  expect(await checkboxes.nth(1).isChecked()).toBeFalsy();

  console.log('✅ Checkbox test passed!');
});
