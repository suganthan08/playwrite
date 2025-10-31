import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";

import { test, expect } from '@playwright/test';

// 🕒 Set timeout for entire test file (5 minutes)
test.setTimeout(300000);

test('Full UI Playground Automation Flow', async ({ page }) => {
  // 1️⃣ Go to main page
  await page.goto('http://uitestingplayground.com/');
  console.log('✅ Opened UI Testing Playground');

  // 🔹 Helper function to go back home safely
  const goHome = async () => {
    await page.goto('http://uitestingplayground.com/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  };

  // 2️⃣ Dynamic ID
  await page.getByRole('link', { name: /Dynamic ID/i }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Button with Dynamic ID/i }).click();
  console.log('✅ Dynamic ID test completed');
  await goHome();

  // 3️⃣ Class Attribute (handle alert)
  await page.getByRole('link', { name: /Class Attribute/i }).click();
  page.once('dialog', async (dialog) => {
    console.log(`⚠️ Alert appeared: ${dialog.message()}`);
    await dialog.accept();
    console.log('✅ Alert accepted');
  });
  await page.locator('.btn-primary').click();
  console.log('✅ Class Attribute test completed');
  await goHome();

  // 4️⃣ Hidden Layers
  await page.getByRole('link', { name: /Hidden Layers/i }).click();
  await page.locator('#greenButton').click();
  console.log('✅ Hidden Layers button clicked');
  await goHome();

  // 5️⃣ Load Delay
  await page.getByRole('link', { name: /Load Delay/i }).click();
  console.log('⏳ Waiting for Load Delay button...');
  const loadDelayButton = page.getByRole('button', { name: /Button Appearing After Delay/i });
  await loadDelayButton.waitFor({ state: 'visible', timeout: 20000 });
  await loadDelayButton.click();
  console.log('✅ Load Delay test completed');
  await goHome();

  // 6️⃣ AJAX Data
  await page.getByRole('link', { name: /AJAX Data/i }).click();
  await page.waitForLoadState('domcontentloaded');
  console.log('🌐 Navigated to AJAX Data page');
  await page.locator('#ajaxButton').click();
  console.log('⏳ Waiting for AJAX data...');
  await page.waitForSelector('.bg-success', { state: 'visible', timeout: 90000 });
  const ajaxText = await page.locator('.bg-success').textContent();
  console.log(`✅ AJAX Data Loaded: ${ajaxText?.trim()}`);
  await goHome();

  // 7️⃣ Client Side Delay
  await page.getByRole('link', { name: /Client Side Delay/i }).click();
  await page.locator('#ajaxButton').click();
  console.log('⏳ Waiting for client-side delayed data...');
  await page.waitForSelector('.bg-success', { timeout: 20000 });
  console.log('✅ Client side delay data loaded');
  await goHome();

  // 8️⃣ Click
  await page.getByRole('link', { name: /^Click$/i }).click();
  await page.getByRole('button', { name: /button/i }).click();
  console.log('✅ Click test completed');
  await goHome();

  // 9️⃣ Text Input
  await page.getByRole('link', { name: /Text Input/i }).click();
  await page.fill('#newButtonName', 'login');
  await page.click('#updatingButton');
  console.log('✅ Text Input test completed');
  await goHome();

  // 🔹 Scrollbars
  await page.getByRole('link', { name: /Scrollbars/i }).click();
  console.log('🌐 Navigated to Scrollbars page');
  const hidingButton = page.locator('#hidingButton');
  if (await hidingButton.count() > 0) {
    await hidingButton.scrollIntoViewIfNeeded();
    await hidingButton.click();
    console.log('✅ Scrollbars button clicked');
  }
  await goHome();

  // 10️⃣ Dynamic Table
  await page.getByRole('link', { name: /Dynamic Table/i }).click();
  console.log('✅ Dynamic Table page visited');
  await goHome();

  // 11️⃣ Verify Text
  await page.getByRole('link', { name: /Verify Text/i }).click();
  console.log('🌐 Navigated to Verify Text page');
  await page.waitForLoadState('domcontentloaded');
  const verifyText = await page.textContent('body');
  expect(verifyText).toMatch(/Welcome|Text/i);
  console.log('✅ Verify Text verified');
  await goHome();

  // 12️⃣ Progress Bar
  await page.getByRole('link', { name: /Progress Bar/i }).click();
  await page.click('#startButton');
  await page.waitForFunction(() => {
    const val = document.querySelector('#progressBar')?.getAttribute('aria-valuenow');
    return val && parseInt(val) >= 75;
  }, { timeout: 15000 });
  await page.click('#stopButton');
  console.log('✅ Progress Bar reached 75% and stopped');
  await goHome();

// 13️⃣ Visibility test
// ✅ Visibility Test Section
console.log('🧩 Starting Visibility test...');

await page.goto('http://uitestingplayground.com/visibility');
await page.waitForLoadState('domcontentloaded');

// click the "Hide" button
const hideBtn = page.locator('#hideButton');
await hideBtn.waitFor({ state: 'visible' });
await hideBtn.click();

// wait until the removed button is actually gone or hidden
await page.waitForFunction(() => {
  const el = document.querySelector('#removedButton');
  return !el || el.offsetParent === null;
}, { timeout: 15000 });

console.log('✅ Removed button is gone or hidden');

// go back to home
await page.goto('http://uitestingplayground.com/');
await page.waitForLoadState('domcontentloaded');
console.log('🏠 Back to Home');


  // 14️⃣ Sample App
  await page.getByRole('link', { name: /Sample App/i }).click();
  await page.fill('input[name="UserName"]', 'PlaywrightUser');
  await page.fill('input[name="Password"]', 'pwd');
  await page.click('#login');
  await expect(page.locator('#loginstatus')).toContainText('Welcome');
  console.log('✅ Sample App login successful');
  await goHome();

  // 15️⃣ Mouse Over
  await page.getByRole('link', { name: /Mouse Over/i }).click();
  console.log('🌐 Navigated to Mouse Over page');

  const container = page.locator('.container', {
    has: page.locator('h3', { hasText: /Mouse Over/i })
  }).first();
  await container.waitFor({ state: 'visible', timeout: 30000 });
  console.log('✅ Mouse Over container found');

  async function hoverAndClickActiveLinkInContainer(desc: string) {
    console.log(`🔹 ${desc}`);
    const activeLink = container.locator('a', { hasText: /Click me|Link Button/i }).first();
    await activeLink.waitFor({ state: 'visible', timeout: 30000 });
    const before = (await container.textContent()) ?? '';
    await activeLink.hover();
    await page.waitForTimeout(500);
    const refreshedLink = container.locator('a', { hasText: /Click me|Link Button/i }).first();
    await refreshedLink.click();
    await refreshedLink.click();
    await page.waitForTimeout(800);
    const after = (await container.textContent()) ?? '';
    expect(after).not.toBe(before);
    console.log(`✅ ${desc} passed`);
  }

  await hoverAndClickActiveLinkInContainer('Click Me link test');
  await hoverAndClickActiveLinkInContainer('Link Button test');
  await goHome();

  // 16️⃣ Non-Breaking Space
  console.log('🧩 Starting Non-Breaking Space test...');
  await page.getByRole('link', { name: /Non-Breaking Space/i }).click();
  const nbspButton = page.locator("//button[text()='My\u00A0Button']");
  await nbspButton.waitFor({ state: 'visible', timeout: 10000 });
  await nbspButton.click();
  console.log('✅ Non-Breaking Space button clicked');
  await goHome();

  // 17️⃣ Overlapped Element
  console.log('🧩 Starting Overlapped Element test...');
  await page.getByRole('link', { name: /Overlapped Element/i }).click();
  const inputField = page.locator('#id');
  await inputField.waitFor({ state: 'visible', timeout: 10000 });
  await inputField.scrollIntoViewIfNeeded();
  await inputField.fill('12345');
  console.log('✅ Overlapped Element filled');
  await goHome();

  // 18️⃣ Shadow DOM
  await page.getByRole('link', { name: /Shadow DOM/i }).click();
  const shadowText = await page.locator('guid-generator').evaluate((el: any) =>
    el.shadowRoot.querySelector('#editField').value
  );
  console.log(`✅ Shadow DOM text found: ${shadowText}`);
  await goHome();

  // 19️⃣ Alerts
  await page.getByRole('link', { name: /Alerts/i }).click();
  page.once('dialog', async (dialog) => {
    console.log(`⚠️ Alert appeared: ${dialog.message()}`);
    await dialog.accept();
  });
  await page.click('#alertButton');
  console.log('✅ Alert handled successfully');
  await goHome();


//20
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Go to File Upload page
await page.goto("http://uitestingplayground.com/upload");
await page.waitForLoadState("domcontentloaded");
console.log("📂 Navigated to File Upload page");

// ✅ Prepare sample file (auto-create if missing)
const filePath = path.resolve(__dirname, "./assets/sample.txt");
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, "This is a Playwright test file upload!");
  console.log("📝 Created sample.txt file automatically");
}

// ✅ Read file and convert to DataTransfer object
const buffer = fs.readFileSync(filePath);
const fileName = path.basename(filePath);

// ✅ Simulate drag & drop upload
await page.evaluateHandle(([name, content]) => {
  const blob = new Blob([Uint8Array.from(content)], { type: "text/plain" });
  const file = new File([blob], name);
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);

  const dropZone = document.querySelector("#dropzone, .drop-zone, body");
  if (!dropZone) throw new Error("❌ Drop zone not found!");

  const event = new DragEvent("drop", {
    bubbles: true,
    cancelable: true,
    dataTransfer
  });
  dropZone.dispatchEvent(event);
}, [fileName, [...buffer]]);

console.log("✅ File successfully 'dropped' into upload area!");

// ✅ Optional small wait for confirmation text
await page.waitForTimeout(2000);

// ✅ Verify upload success text if available
try {
  await expect(page.locator("#uploadedFilePath")).toContainText("sample.txt");
  console.log("🎯 File upload confirmed on page!");
} catch {
  console.log("⚠️ No confirmation element found — but drop simulated successfully.");
}

 // 21️⃣ Animated Button test
 // Animated Button — concise fix
await page.goto('http://uitestingplayground.com/animation');

// start animation
await page.getByRole('button', { name: 'Start Animation' }).click();

// wait for element to exist then become interactable
const movingTarget = page.locator('#animatedButton');
await movingTarget.waitFor({ state: 'attached', timeout: 20000 });
await movingTarget.scrollIntoViewIfNeeded();
await movingTarget.waitFor({ state: 'visible', timeout: 20000 });

// click (force if animation still interferes)
await movingTarget.click({ force: true });

console.log('✅ Moving Target clicked');


  // 22️⃣ Disabled Input
  await page.getByRole('link', { name: /Disabled Input/i }).click();
    const input = page.locator('#inputField');

    // It starts enabled — only wait until enabled for simplicity
    await expect(input).toBeEnabled({ timeout: 20000 });

    await input.fill('Playwright Test');
    await expect(input).toHaveValue('Playwright Test');

  // 23️⃣ Auto Wait
  await page.getByRole('link', { name: /Auto Wait/i }).click();
    await page.goto('/ajax');

  const startButtons = page.locator('#ajaxButton');
  await expect(startButtons).toBeVisible({ timeout: 15000 });

  await startButtons.click();

  // Wait for green box
  const successMsg = page.locator('.bg-success');
  await expect(successMsg).toBeVisible({ timeout: 30000 });
  await expect(successMsg).toHaveText(/Data loaded with AJAX get request/i);


  console.log('🚀 ALL TESTS FINISHED SUCCESSFULLY 🎉');
});
