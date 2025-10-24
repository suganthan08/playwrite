import { test , expect } from "@playwright/test"

test("title", async ({page}) => {

    await page.goto("https://www.google.com/");

    let title: string = await page.title();
    console.log("title: ",title);

    await expect(page).toHaveTitle("Google");


})