import { test, expect } from "@playwright/test";

test("Auto Wait - Manual Element Type Testing", async ({ page }) => {
  // Step 1️⃣: Open the Auto Wait page
  await page.goto("http://www.uitestingplayground.com/autowait", {
    waitUntil: "domcontentloaded",
  });
  console.log("✅ Page loaded: Auto Wait");

  // Step 2️⃣: Click the Start button to load iframe
  const startButton = page.locator("button#startButton");
  await expect(startButton).toBeVisible({ timeout: 10000 });
  await startButton.click();
  console.log("✅ Clicked Start button");

  // Step 3️⃣: Wait for iframe to appear
  const iframe = page.frameLocator("iframe");
  await expect(iframe.locator("#elementSelect")).toBeVisible({
    timeout: 15000,
  });
  console.log("✅ Iframe loaded successfully");

  // Step 4️⃣: Use manual element types (since dropdown may not load dynamically)
  const elementTypes = ["button", "input", "textarea", "select", "label"];
  console.log(`🧩 Testing manually with element types: ${elementTypes.join(", ")}`);

  // Step 5️⃣: Loop through each element type
  for (const elementType of elementTypes) {
    console.log(`\n🔹 Testing element type: ${elementType}`);

    const dropdown = iframe.locator("#elementSelect");
    await dropdown.selectOption(elementType);
    await expect(dropdown).toHaveValue(elementType);
    console.log(`✅ Selected element type: ${elementType}`);

    // Step 6️⃣: Check all checkboxes
    const checkboxes = iframe.locator(".form-check-input");
    const total = await checkboxes.count();
    for (let i = 0; i < total; i++) {
      const box = checkboxes.nth(i);
      if (!(await box.isChecked())) {
        await box.check();
      }
    }
    console.log("✅ All checkboxes checked");

    // Step 7️⃣: Click Apply buttons (3s, 5s, 10s)
    for (const delay of [3, 5, 10]) {
      const applyButton = iframe.locator(`#apply${delay}`);
      await expect(applyButton).toBeEnabled({ timeout: 10000 });

      console.log(`⏳ Clicking Apply ${delay}s`);
      await applyButton.click();

      // Wait for target to reappear
      const target = iframe.locator("#target");
      await target.waitFor({ state: "visible", timeout: (delay + 5) * 1000 });

      const tagName = await target.evaluate((el) => el.tagName.toLowerCase());

      if (tagName === "button") {
        await target.click();
        console.log("✅ Clicked button");
      } else if (tagName === "input" || tagName === "textarea") {
        await target.fill("Hello Auto Wait!");
        console.log("✅ Typed into input/textarea");
      } else if (tagName === "select") {
        await target.selectOption("Item 2");
        console.log("✅ Selected dropdown option");
      } else if (tagName === "label") {
        await target.click();
        console.log("✅ Clicked label");
      }

      // Step 8️⃣: Verify the status message
      const status = await iframe.locator("#opstatus").innerText();
      console.log(`📢 Status: ${status}`);
    }
  }

  console.log("🎯 All manual element checks completed successfully!");
});
