import { test, expect } from "@playwright/test";

test("Google page title test", async ({ page }) => {
  // Go to Google
  await page.goto("https://www.google.com");

  // Check the page title
  await expect(page).toHaveTitle(/Google/);
});

test("Search test on Google", async ({ page }) => {
  await page.goto("https://www.google.com");

  // Type in the search box
  await page.fill("textarea[name='q']", "Playwright testing");

  // Press Enter
  await page.keyboard.press("Enter");

  // Wait for results
  await page.waitForSelector("#search");

  // Check result contains text
  const content = await page.textContent("body");
  expect(content).toContain("Playwright");
});
