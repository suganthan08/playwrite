import{test ,expect}from '@playwright/test'; 


test('login flow test',async({page})=>{
    await page.goto('https://demo.playwright.dev/login');

    await page.fill('#username',"admin");
    await page.fill('#password',"admin123");

    await page.click('button[type="submit"]');

    const message = await page.locator('#message');
    await expect(message).toHaveText('login successfully');


});