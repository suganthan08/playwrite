import { test, expect } from '@playwright/test';

test('select radio button safely', async ({ page }) => {
  await page.goto('https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_input_radio', { waitUntil: 'domcontentloaded' });

  // frame la iruka radio buttons select pannum (W3Schools example inside iframe)
  const frame = page.frameLocator('iframe[name="iframeResult"]');

  // locate male & female radio
  const male = frame.locator('input[value="male"]');
  const female = frame.locator('input[value="female"]');

  // wait for elements to load
  await male.waitFor({ state: 'visible' });
  await female.waitFor({ state: 'visible' });

  // step 1: select male if not selected
  if (!(await male.isChecked())) {
    await male.check();
  }
  await expect(male).toBeChecked();

  // step 2: switch to female
  await female.check();
  await expect(female).toBeChecked();
  await expect(male).not.toBeChecked();
});
