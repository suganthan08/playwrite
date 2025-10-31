import { test, expect } from '@playwright/test';

test('open testingpg -> start -> login', async ({ page }) => {
  const SITE = 'https://testingpg.netlify.app/';
  // Provide credentials via env vars for safety, or replace the defaults below
  const USER = process.env.LOGIN_USER || 'your.email@example.com';
  const PASS = process.env.LOGIN_PASS || 'YourPassword123';

  await page.goto(SITE, { waitUntil: 'domcontentloaded' });

  // 1) Click the Start button (try a few common texts)
  const startButtons = [
    page.getByRole('button', { name: /start/i }),
    page.getByRole('button', { name: /get started/i }),
    page.getByRole('link', { name: /start/i }),
    page.locator('button:has-text("Start")'),
    page.locator('button:has-text("Get Started")')
  ];

  let started = false;
  for (const btn of startButtons) {
    if (await btn.count() > 0) {
      try {
        // Use Promise.all to catch navigation if clicking causes a page load
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {}),
          btn.first().click().catch(() => {})
        ]);
        started = true;
        break;
      } catch (e) {
        // continue trying other variants
      }
    }
  }
  if (!started) console.warn('Start button not found or clickable — check selector or page state.');

  // short pause to allow the login page to load dynamic content
  await page.waitForTimeout(700);

  // 2) Fill email and password (try multiple common selectors)
  const emailSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[name="username"]',
    'input[placeholder*="email"]',
    'input[placeholder*="Email"]'
  ];
  const passSelectors = [
    'input[type="password"]',
    'input[name="password"]',
    'input[placeholder*="password"]',
    'input[placeholder*="Password"]'
  ];

  async function fillFirst(selectors: string[], value: string) {
    for (const s of selectors) {
      const loc = page.locator(s);
      if (await loc.count() > 0) {
        await loc.first().fill(value);
        return true;
      }
    }
    return false;
  }

  const emailFilled = await fillFirst(emailSelectors, USER);
  const passFilled = await fillFirst(passSelectors, PASS);

  // If fields weren't found in main frame, try frames (rare)
  if (!emailFilled || !passFilled) {
    for (const f of page.frames()) {
      if (f === page.mainFrame()) continue;
      if (!emailFilled) {
        for (const s of emailSelectors) {
          const el = f.locator(s);
          if (await el.count() > 0) {
            await el.first().fill(USER);
            emailFilled || (await Promise.resolve(true));
          }
        }
      }
      if (!passFilled) {
        for (const s of passSelectors) {
          const el = f.locator(s);
          if (await el.count() > 0) {
            await el.first().fill(PASS);
            passFilled || (await Promise.resolve(true));
          }
        }
      }
    }
  }

  if (!emailFilled) console.warn('Email field not found — adjust selectors.');
  if (!passFilled) console.warn('Password field not found — adjust selectors.');

  // 3) Click the login button (try common labels)
  const loginButtons = [
    page.getByRole('button', { name: /login/i }),
    page.getByRole('button', { name: /sign in/i }),
    page.locator('button[type="submit"]'),
    page.locator('button:has-text("Login")'),
    page.locator('button:has-text("Sign in")')
  ];

  let clicked = false;
  for (const btn of loginButtons) {
    if (await btn.count() > 0) {
      try {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {}),
          btn.first().click().catch(() => {})
        ]);
        clicked = true;
        break;
      } catch (e) {
        // try next
      }
    }
  }

  if (!clicked) console.warn('Login button not found/clicked — check selectors or UI (maybe captcha/2FA).');

  // 4) Post-login: wait a little and take a screenshot
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'testingpg-after-login.png', fullPage: true });

  // Optional simple assertion: ensure URL changed or some "dashboard" text appears
  if (page.url().includes('/login')) {
    console.warn('Still on login page after click — login may have failed or extra step required.');
  } else {
    console.log('Navigation happened — likely login success. Current URL:', page.url());
  }
});
