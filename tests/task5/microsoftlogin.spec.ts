import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { authenticator } from "otplib";

dotenv.config();

const EMAIL = process.env.MS_EMAIL!;
const PASSWORD = process.env.MS_PASSWORD!;
const TOTP_SECRET = process.env.MS_TOTP_SECRET!;

test("Microsoft Office login", async ({ page }) => {
  console.log("🚀 Starting Microsoft login automation...");

  // Step 1: Go to Office
  await page.goto("https://www.office.com/");
  await page.getByRole("link", { name: /Sign in/i }).click();

  // Step 2: Email
  const emailInput = page.getByRole("textbox", { name: /Email|Sign in/i });
  await emailInput.waitFor({ state: "visible", timeout: 40000 });
  await emailInput.fill(EMAIL);
  await page.getByRole("button", { name: /Next/i }).click();

  // Step 3: Password
  const passwordInput = page.getByRole("textbox", { name: /Password/i });
  await passwordInput.waitFor({ state: "visible", timeout: 40000 });
  await passwordInput.fill(PASSWORD);
  await page.getByRole("button", { name: /^Sign in$|^Next$/i }).click();

  // Step 4: MFA setup (use verification code)
  const useCodeBtn = page.getByRole("button", { name: /Use a verification code/i });
  if (await useCodeBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
    console.log("👉 Clicking 'Use a verification code'");
    await useCodeBtn.click();
  }

  const haveCodeBtn = page.getByRole("button", { name: /I have a code/i });
  if (await haveCodeBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
    console.log("👉 Clicking 'I have a code'");
    await haveCodeBtn.click();
  }

  // Step 5: Wait for OTP input
  const otpInput = page.getByRole("textbox", { name: /Enter the code you received/i });
  await otpInput.waitFor({ state: "visible", timeout: 20000 });

  // Step 6: Generate & fill OTP
  let otp = authenticator.generate(TOTP_SECRET);
  console.log("🔢 Generated OTP:", otp);
  await otpInput.fill(otp);

  const verifyButton = page.getByRole("button", { name: /^Verify$/i });
  await verifyButton.waitFor({ state: "visible", timeout: 10000 });
  await verifyButton.click({ force: true });
  console.log("✅ Clicked Verify button");

  // Step 7: Retry OTP if failed
  const errorAlert = page.getByRole("alert", { name: /didn't work|try again/i });
  if (await errorAlert.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log("⚠️ First OTP failed — regenerating...");
    otp = authenticator.generate(TOTP_SECRET);
    await otpInput.fill(otp);
    await verifyButton.click({ force: true });
  }

  // Step 8: Handle “Stay signed in?” — supports iframe and main page
  await page.waitForTimeout(2000);
  console.log("🟢 Checking for 'Stay signed in?' screen...");

  // Find frame that contains the heading
  const frames = page.frames();
  let stayFrame = frames.find(f =>
    f.url().includes("login.live.com") || f.url().includes("ppsecure")
  );

  // Try current page if no frame found
  const context = stayFrame || page;

  const stayHeading = context.getByRole("heading", { name: /Stay signed in\?/i });
  if (await stayHeading.isVisible({ timeout: 15000 }).catch(() => false)) {
    console.log("🟢 'Stay signed in?' detected");

    // Choose action
    const yesButton = context.getByRole("button", { name: /^Yes$/i });
    const noButton = context.getByRole("button", { name: /^No$/i });

    // 👇 Change this line to yesButton if you prefer staying logged in
    const targetButton = noButton;

    if (await targetButton.isVisible({ timeout: 8000 }).catch(() => false)) {
      await targetButton.click({ force: true });
      console.log(`✅ Clicked '${targetButton === yesButton ? "Yes" : "No"}' on Stay signed in`);
    } else {
      console.log("⚠️ Buttons not clickable — skipping step.");
    }
  } else {
    console.log("⏭️ No Stay signed in screen detected.");
  }

  // Step 9: Wait for dashboard
  await page.waitForLoadState("networkidle", { timeout: 30000 });
  await expect(page).toHaveURL(/m365\.cloud\.microsoft\/search/);
  console.log("🎉 Login successful — reached Office dashboard!");

   // Step 10: Open Word from sidebar
  console.log("📄 Opening Word from M365 Copilot sidebar...");

  // Wait for sidebar to appear and locate the Word button
  const wordButton = page.getByRole("button", { name: /^Word$/i });
  await wordButton.waitFor({ state: "visible", timeout: 40000 });
  await wordButton.click();
  console.log("✅ Clicked on 'Word' sidebar button!");

  // Step 11: Wait for Word page to load
  await page.waitForURL(/word\.cloud\.microsoft/, { timeout: 40000 });
  await page.waitForLoadState("domcontentloaded");
  console.log("✅ Redirected to Word Online successfully!");

   // Step 12: Create a new blank Word document
  console.log("📄 Creating a new blank Word document...");
  const newBlankDoc = page.getByRole("link", { name: /New blank document|Blank document/i });
  const newBlankButton = page.getByRole("button", { name: /New blank document|Blank document/i });
  const altBlank = page.locator('a[title*="Blank document"], div:has-text("New blank document"), div:has-text("Blank document")');

  await Promise.any([
    newBlankDoc.waitFor({ state: "visible", timeout: 30000 }).catch(() => null),
    newBlankButton.waitFor({ state: "visible", timeout: 30000 }).catch(() => null),
    altBlank.first().waitFor({ state: "visible", timeout: 30000 }).catch(() => null),
  ]);

  if (await newBlankDoc.isVisible().catch(() => false)) {
    await newBlankDoc.click();
  } else if (await newBlankButton.isVisible().catch(() => false)) {
    await newBlankButton.click();
  } else {
    await altBlank.first().click();
  }
  console.log("✅ Clicked 'New blank document' successfully!");

  // Step 13: Wait for editor to load
  await page.waitForLoadState("networkidle", { timeout: 60000 });
  await expect(page).toHaveURL(/word\.(cloud\.microsoft|office\.com).*document/);
  console.log("📝 Blank Word document created successfully!");
});


















// import { test, expect } from "@playwright/test";
// import dotenv from "dotenv";
// import { authenticator } from "otplib";

// dotenv.config();

// const EMAIL = process.env.MS_EMAIL!;
// const PASSWORD = process.env.MS_PASSWORD!;
// const TOTP_SECRET = process.env.MS_TOTP_SECRET || "";

// test("Microsoft Office login with TOTP", async ({ page }) => {
//   await page.goto("https://www.office.com/");

//   // Click Sign in
//   await page.getByRole("link", { name: /Sign in/i }).click();

//   // Fill email
//   const emailInput = page.getByRole("textbox", { name: /Email|Sign in|Enter your email/i });
//   await emailInput.waitFor({ state: "visible", timeout: 20000 });
//   await emailInput.fill(EMAIL);
//   await page.locator('input[type="submit"], button[type="submit"], button:has-text("Next")').first().click();

//   // Wait for password page & fill password
//   const passwordBox = page.getByRole("textbox", { name: /Password/i }).first();
//   await passwordBox.waitFor({ state: "visible", timeout: 20000 });
//   await passwordBox.click();
//   await passwordBox.fill(PASSWORD);
//   await page.getByRole("button", { name: /^Next$|^Sign in$|^Submit$/i }).first().click();

//   // Wait for possible MFA / 2FA page to show up
//   // We'll try multiple selectors so it's robust across variations.
//   const totpSelectors = [
//     'input[name="otc"]',                           // common
//     'input[type="tel"]',                           // sometimes used
//     'input[aria-label*="code"]',                   // "Enter code" etc
//     'input[aria-label*="Authenticator"]',
//     'input[placeholder*="code"]',
//     'input[id*="otc"]',
//   ];

//   // Wait until either we're redirected to dashboard OR one of totp inputs appears
//   const dashboardOrOtp = await Promise.race([
//     page.waitForURL(/.*(office\.com|microsoft\.com).*$/, { timeout: 20000 }).then(() => "dashboard").catch(() => null),
//     (async () => {
//       for (const sel of totpSelectors) {
//         try {
//           const locator = page.locator(sel);
//           await locator.waitFor({ state: "visible", timeout: 7000 });
//           return sel;
//         } catch (e) {
//           // try next
//         }
//       }
//       return null;
//     })(),
//   ]);

//   if (dashboardOrOtp === "dashboard") {
//     console.log("✅ Logged in without MFA!");
//     return;
//   }

//   // If we detected an OTP input selector, fill TOTP
//   let filled = false;
//   const totp = TOTP_SECRET ? authenticator.generate(TOTP_SECRET) : null;

//   if (!totp) {
//     throw new Error("TOTP secret not found in MS_TOTP_SECRET env variable.");
//   }

//   // Try known selectors first
//   for (const sel of totpSelectors) {
//     const locator = page.locator(sel);
//     if (await locator.count() > 0) {
//       try {
//         // If single input exists, fill it
//         await locator.first().click();
//         await locator.first().fill(totp);
//         filled = true;
//         break;
//       } catch (e) {
//         // ignore and fallback
//       }
//     }
//   }

//   // Fallback: some pages use 6 separate inputs for each digit
//   if (!filled) {
//     const multiInputs = page.locator('input').filter({ has: page.locator('[inputmode="numeric"],[aria-label*="digit"],[aria-label*="code"]') });
//     const count = await multiInputs.count();
//     if (count >= 4 && count <= 8) {
//       // fill digit by digit
//       for (let i = 0; i < Math.min(totp.length, count); i++) {
//         await multiInputs.nth(i).click();
//         await multiInputs.nth(i).fill(totp[i]);
//       }
//       filled = true;
//     } else {
//       // Last resort: try any visible numeric input
//       const anyVisible = page.locator('input[type="text"], input[type="tel"], input[type="number"]').filter({ hasText: "" });
//       if ((await anyVisible.count()) > 0) {
//         await anyVisible.first().click();
//         await anyVisible.first().fill(totp);
//         filled = true;
//       }
//     }
//   }

//   if (!filled) {
//     throw new Error("Could not find OTP input to fill.");
//   }

//   // Click verify/submit
//   const submitButtons = [
//     page.getByRole("button", { name: /Verify|Next|Submit|Sign in|Confirm/i }),
//     page.locator('input[type="submit"]'),
//     page.locator('button:has-text("Verify")'),
//   ];
//   for (const btn of submitButtons) {
//     try {
//       if ((await btn.count()) > 0) {
//         await btn.first().click();
//         break;
//       }
//     } catch (e) {
//       // continue
//     }
//   }

//   // Wait for dashboard or success navigation
//   await page.waitForLoadState("networkidle");
//   await expect(page).toHaveURL(/office\.com|microsoft\.com/);

//   console.log("✅ Logged in with TOTP successfully!");
// });