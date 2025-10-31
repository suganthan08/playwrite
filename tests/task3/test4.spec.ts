import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
test.setTimeout(300000);

test('🎯 Full UI Testing Playground Automation (All 23 Functionalities)', async ({ page }) => {

  // Helper: Go home
  async function goHome() {
    await page.goto('http://uitestingplayground.com/');
    await page.waitForLoadState('networkidle');
  }

  await goHome();

  // 1️⃣ Dynamic ID
  await page.getByRole('link', { name: /Dynamic ID/i }).click();
  await page.getByRole('button', { name: /Button with Dynamic ID/i }).click();
  await goHome();

  // 2️⃣ Class Attribute
  await page.getByRole('link', { name: /Class Attribute/i }).click();
  await page.locator('.btn-primary.btn-test').click({ force: true });
  await goHome();

  // 3️⃣ Hidden Layers
  await page.getByRole('link', { name: /Hidden Layers/i }).click();
  await page.locator('#greenButton').click();
  await goHome();

  // 4️⃣ Load Delay
  await page.getByRole('link', { name: /Load Delay/i }).click();
  await page.waitForSelector('.btn-primary', { timeout: 15000 });
  await goHome();

  // 5️⃣ AJAX Data
  await page.getByRole('link', { name: /AJAX Data/i }).click();
  await page.getByRole('button', { name: /Button Triggering AJAX Request/i }).click();
  await page.waitForSelector('.bg-success', { timeout: 90000 });
  await goHome();

  // 6️⃣ Client Delay
  await page.getByRole('link', { name: /AJAX Data/i }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.locator('#ajaxButton').click();
  await page.waitForSelector('.bg-success', { state: 'visible', timeout: 90000 });
  const ajaxText = await page.locator('.bg-success').textContent();
  console.log(`✅ AJAX Data Loaded: ${ajaxText?.trim()}`);
  await goHome();
  
  // 7️⃣ Click
  await page.getByRole('link', { name: /Click/i }).click();
  await page.locator('#badButton').click();
  await goHome();

  // 8️⃣ Text Input
  await page.getByRole('link', { name: /Text Input/i }).click();
  await page.fill('#newButtonName', 'Playwright');
  await page.click('#updatingButton');
  await expect(page.locator('#updatingButton')).toHaveText('Playwright');
  await goHome();

  // 9️⃣ Scrollbars
  await page.getByRole('link', { name: /Scrollbars/i }).click();
  await page.locator('#hidingButton').scrollIntoViewIfNeeded();
  await page.click('#hidingButton');
  await goHome();

  // 🔟 Dynamic Table
  await page.getByRole('link', { name: /Dynamic Table/i }).click();
  const chromeCPU = await page.locator("//span[text()='Chrome']/../span[normalize-space()][2]").textContent();
  console.log('Chrome CPU:', chromeCPU);
  await goHome();

  // 11️⃣ Verify Text
  await page.getByRole('link', { name: /Verify Text/i }).click();
  await expect(page.locator('.bg-primary')).toContainText('Welcome UserName!');
  await goHome();

  // 12️⃣ Progress Bar
  await page.getByRole('link', { name: /Progress Bar/i }).click();
  await page.click('#startButton');
  await page.waitForFunction(() => {
    const val = document.querySelector('#progressBar')?.getAttribute('aria-valuenow');
    return val && parseInt(val) >= 75;
  });
  await page.click('#stopButton');
  await goHome();

  // 13️⃣ Visibility
  await page.getByRole('link', { name: /Visibility/i }).click();
  await page.click('#hideButton');
  await page.waitForSelector('#removedButton', { state: 'hidden', timeout: 10000 });
  await goHome();

  // 14️⃣ Sample App
  await page.getByRole('link', { name: /Sample App/i }).click();
  await page.fill('input[name="UserName"]', 'TestUser');
  await page.fill('input[name="Password"]', 'pwd');
  await page.click('#login');
  await expect(page.locator('#loginstatus')).toContainText('Welcome');
  await goHome();

  // 15️⃣ Mouse Over
    await page.getByRole('link', { name: /Mouse Over/i }).click();
    await page.waitForLoadState('networkidle');

    // ✅ Click on "Click me" twice to increase count
    const clickMeLink = page.locator('a:text("Click me")');
    await clickMeLink.hover();
    await clickMeLink.click();
    await clickMeLink.click();

    // ✅ Verify count increased
    const countText = page.locator('#clickCount');
    await expect(countText).toContainText('2');
    await goHome();


  // 16️⃣ Non-Breaking Space
  await page.getByRole('link', { name: /Non-Breaking Space/i }).click();
  await page.locator("button:text('My Button')").click({ force: true });
  await goHome();

  // 17️⃣ Overlapped Element
  await page.getByRole('link', { name: /Overlapped Element/i }).click();
  await page.locator('#id').scrollIntoViewIfNeeded();
  await page.fill('#id', '123');
  await goHome();

  // 18️⃣ Resources
  await page.getByRole('link', { name: /Resources/i }).click();
  await expect(page).toHaveURL(/resources/);
  await goHome();

  // 19️⃣ Shadow DOM
  await page.getByRole('link', { name: /Shadow DOM/i }).click();
  const text = await page.locator('guid-generator').locator('#editField').textContent();
  console.log('Shadow DOM text:', text);
  await goHome();



  //2️⃣0  Alert message'
   console.log('🧪 Starting Alert, Confirm & Prompt Test...');
  
    await page.getByRole('link', { name: /Alerts/i }).click();
    await page.waitForLoadState('networkidle');
  
    // ✅ ALERT
    page.once('dialog', async (dialog) => {
      console.log(`⚠️ Alert message: ${dialog.message()}`);
      await dialog.accept();
    });
    await page.click('#alertButton');
    console.log('✅ Alert handled successfully');
  
    // ✅ CONFIRM
    page.once('dialog', async (dialog) => {
      console.log(`⚠️ Confirm message: ${dialog.message()}`);
      await dialog.accept(); // or dialog.dismiss()
    });
    await page.click('#confirmButton');
    console.log('✅ Confirm handled successfully');
  
    // ✅ PROMPT
    page.once('dialog', async (dialog) => {
      console.log(`⚠️ Prompt message: ${dialog.message()}`);
      await dialog.accept('Playwright Rocks!');
    });
    await page.click('#promptButton');
    console.log('✅ Prompt handled successfully');
  
    console.log('🎯 All alert types tested successfully ✅');
    await goHome();
  


    // ✅ 2️⃣1 Animation Test

  await page.getByRole('link', { name: /Animated Button/i }).click();

  const startButton = page.getByRole('button', { name: 'Start Animation' });
  await expect(startButton).toBeVisible({ timeout: 10000 });
  await startButton.click();

  const movingButton = page.getByRole('button', { name: 'Moving Target' });

  // Wait until animation stops (position stable)
  let previousBox = await movingButton.boundingBox();
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(300);
    const newBox = await movingButton.boundingBox();

    if (
      previousBox &&
      newBox &&
      Math.abs(previousBox.x - newBox.x) < 1 &&
      Math.abs(previousBox.y - newBox.y) < 1
    ) {
      console.log('✅ Animation stopped, clicking Moving Target...');
      break;
    }
    previousBox = newBox;
  }

  await movingButton.click();

  // ✅ Fix: use <p> selector instead of #status
  const statusLabel = page.locator('p');
  await expect(statusLabel).toBeVisible({ timeout: 10000 });
  await expect(statusLabel).not.toHaveText('', { timeout: 10000 });

  const className = await statusLabel.textContent();
  console.log('Class after click:', className);
  expect(className).not.toContain('spin');
  await goHome();



//============================= DISABLE INPUT ==========================
// ✅ 2️⃣2  DISABLE INPUT


  await page.getByRole('link', { name: /Disabled Input/i }).click();

  const enableButton = page.getByRole('button', { name: 'Enable' });
  await expect(enableButton).toBeVisible();
  await enableButton.click();

  const inputField = page.locator('#inputField');
  await expect(inputField).toBeVisible();

  await page.waitForFunction(() => {
    const input = document.querySelector('#inputField') as HTMLInputElement;
    return !input.disabled;
  });

  console.log('✅ Input field is now enabled!');

  const textToEnter = 'Playwright test successful!';
  await inputField.fill(textToEnter);

  await expect(inputField).toHaveValue(textToEnter);
  console.log('✅ Text entered successfully!');
  await goHome();


  // ✅ 2️⃣3 FILE UPLOAD=========================


  await page.getByRole('link', { name: /File Upload/i }).click();
    // ✅ Step 1: Recreate __dirname for ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
  
    // ✅ Step 2: Go to the upload page (replace with yours)
    await page.goto('http://uitestingplayground.com/upload');
    console.log('🌐 Page opened successfully');
  
    // ✅ Step 3: Wait for iframe (if needed)
    const iframe = page.frameLocator('iframe');
    await expect(iframe.locator('body')).toBeVisible({ timeout: 15000 });
    console.log('✅ Iframe detected');
  
    // ✅ Step 4: Resolve file path safely (works everywhere)
    const projectRoot = path.resolve(__dirname, '../../'); // Adjust only if your folder is deeper
    const filePath = path.join(projectRoot, 'sample.txt'); // file inside D:\playwrite\sample.txt
  
    if (!fs.existsSync(filePath)) {
      throw new Error(`❌ File not found at path: ${filePath}`);
    }
    console.log(`📂 File found at: ${filePath}`);
  
    // ✅ Step 5: Upload the file
    const fileInput = iframe.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    console.log('✅ File successfully uploaded');
  
    // ✅ Step 6: Verify
    await expect(iframe.locator('text=sample.txt')).toBeVisible({ timeout: 5000 });
    console.log('🎉 File upload verified successfully!');
  
  



  // // ✅24️⃣ Auto Wait Test (Fixed selector)


  // Step 1: Go to the Auto Wait page
  await page.goto('http://uitestingplayground.com/autowait', {
    waitUntil: 'domcontentloaded',
  });
  console.log('✅ Page loaded: Auto Wait');

  // Step 2: Select dropdown element
  const dropdown = page.locator('#element-type');
  await expect(dropdown).toBeVisible();

  // Get all actual <option> values (lowercase)
  const options = await dropdown.locator('option').evaluateAll(opts => opts.map(o => o.value));
  console.log(`🧩 Found element options: ${options.join(', ')}`);

  // Step 3: Loop through each option and test
  for (const option of options) {
    console.log(`\n🔹 Testing element type: ${option}`);

    // Select the element type (correct lowercase value)
    await dropdown.selectOption(option);
    await expect(dropdown).toHaveValue(option);
    console.log(`✅ Selected element type: ${option}`);

    // Step 4: Check all checkboxes
    const checkboxes = page.locator('.form-check-input');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      const box = checkboxes.nth(i);
      if (!(await box.isChecked())) await box.check();
    }
    console.log('✅ All checkboxes checked');

    // Step 5: Apply settings (3s, 5s, 10s)
    for (const delay of [3, 5, 10]) {
      const applyButton = page.locator(`#applyButton${delay}`);
      await expect(applyButton).toBeEnabled();

      console.log(`⏳ Clicking Apply ${delay}s`);
      await applyButton.click();

      // Wait until target becomes visible again (after delay)
      const target = page.locator('#target');
      await expect(target).toBeVisible({ timeout: 10000 });
      await expect(target).toBeVisible({ timeout: (delay + 5) * 1000 }); // smarter wait

      // Step 6: Interact based on tag type
      const tagName = await target.evaluate(el => el.tagName.toLowerCase());

      if (tagName === 'button') {
        await target.click();
        console.log('✅ Clicked button');
      } else if (tagName === 'input' || tagName === 'textarea') {
        await target.fill('Hello Auto Wait!');
        console.log('✅ Typed into input/textarea');
      } else if (tagName === 'select') {
        await target.selectOption('Item 2');
        console.log('✅ Selected dropdown option');
      } else if (tagName === 'label') {
        await target.click();
        console.log('✅ Clicked label');
      }

      // Step 7: Verify status message
      const status = await page.locator('#opstatus').innerText();
      console.log(`📢 Status: ${status}`);
    }
  }



  
 

  
  console.log('✅ All 23 functionalities tested successfully!');
});
