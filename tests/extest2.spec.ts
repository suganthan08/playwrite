import { test, expect } from '@playwright/test';

test('Login Test on PracticeTestAutomation', async ({ page }) => {
  // Step 1: Open the website
  await page.goto('https://practicetestautomation.com/practice-test-login/');

  // Step 2: Fill username and password
  await page.locator('#username').fill('student');
  await page.locator('#password').fill('Password123');

  // Step 3: Click the submit button
  await page.locator('#submit').click();

  // Step 4: Verify the new page URL
  await expect(page).toHaveURL('https://practicetestautomation.com/logged-in-successfully/');

  // Step 5: Verify success message
  await expect(page.locator('h1')).toHaveText('Logged In Successfully');
  console.log('✅ Login successful and verified!');

  // Step 6: Logout
  await page.locator('.wp-block-button__link').click();
  await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');
  console.log('✅ Logout successful!');
});

