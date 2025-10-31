import { test, expect } from '@playwright/test';

test('Simulated search -> login -> interact flow', async ({ page }) => {
  // 1️⃣ Go to the test site directly
  await page.goto('https://the-internet.herokuapp.com');
  await page.waitForLoadState('domcontentloaded');

  // 2️⃣ "Search-like" simulation — find and click "Form Authentication" link
  const link = page.locator('a', { hasText: 'Form Authentication' });
  await expect(link).toBeVisible();
  await link.click();

  // 3️⃣ Perform login
  await page.fill('#username', 'tomsmith');
  await page.fill('#password', 'SuperSecretPassword!');
  await page.click('button[type="submit"]');

  // 4️⃣ Verify login success
  const message = page.locator('#flash');
  await expect(message).toContainText('You logged into a secure area!');
  console.log('✅ Logged in successfully!');

  // 5️⃣ Now navigate to Dropdown page
  await page.goto('https://the-internet.herokuapp.com/dropdown');
  const dropdown = page.locator('#dropdown');

  // 6️⃣ Extract and print dropdown options
  const options = await dropdown.locator('option').evaluateAll(opts => opts.map(o => o.textContent?.trim()));
  console.log('📋 Dropdown options:', options);

  // 7️⃣ Select option 2 and verify
  await dropdown.selectOption('2');
  expect(await dropdown.inputValue()).toBe('2');
  console.log('✅ Dropdown select verified successfully!');
});
