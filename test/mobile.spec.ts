const { locators } = require('../globalLocator.js');
const { test, expect, devices } = require('@playwright/test');
const BrowserFactory = require('../BrowserFactory.js');
const abPlaywright = require("alphabin-pw");
const config = require('../playwright.config.js');
const { descriptions } = require('../elementDescriptions.js')

let context;

const projectToBrowser = {
  'Mobile Galaxy S20 Ultra': 'chromium',
  'Mobile Safari': 'webkit',
  // add more if needed
};

test.beforeEach(async ({}, testInfo) => {
  const browserName = projectToBrowser[testInfo.project.name];
  const projectConfig = config.projects.find(p => p.name === testInfo.project.name);
  const result = await BrowserFactory.createBrowserWithContext(browserName, projectConfig);
  context = result.context;
});

test.afterEach(async () => {
    await context?.close();
});

test.use({ ...devices['Galaxy S20 Ultra'] });

test('Alpha_E2E_01 - login to logout', async () => {
  const email = `testing@gmail.com`;
  const password = `Testing@123`;
  const page1 = await context.newPage();
  await page1.goto('http://demo.alphabin.co');
  await abPlaywright.setupLogging(page1);
  await expect(page1).toHaveURL(`https://demo.alphabin.co/`);
  await page1.locator("//button[contains(@class, 'flex') and contains(@class, 'justify-center') and contains(@class, 'lg:hidden')]").click({ force: true });
  await page1.locator("//*[name()='svg'][.//*[name()='path' and contains(@d,'M25.1578 1')]]").nth(1).click({ force: true });
  await expect(page1).toHaveURL(`https://demo.alphabin.co/login`);
  await expect(page1).toHaveTitle(`AB Demo Store`);
  await page1.locator(`input[name="email"]`).click({ force: true });
  await page1.locator(`input[name="email"]`).fill(email);
  await page1.locator( `input[name="password"]`).click({ force: true });
  await page1.locator( `input[name="password"]`).fill(password);
  await page1.locator( `//button[normalize-space()='Sign in']`).click({ force: true });
  await expect(page1).toHaveURL(`https://demo.alphabin.co/`);
  await page1.locator("//button[contains(@class, 'flex') and contains(@class, 'justify-center') and contains(@class, 'lg:hidden')]").click({ force: true });
  await page1.locator(`//*[name()='svg'][.//*[name()='path' and contains(@d,'M25.1578 1')]]`).nth(1).click({ force: true });
  await expect(page1).toHaveURL(`https://demo.alphabin.co/account`);
  // await expect(page1).toHaveTitle(`AB | My Account`);
  await page1.locator(`[class="p-2 bg-white rounded-md border shadow-sm"]`).click({ force: true });
  await page1.waitForTimeout(5000);
  await page1.locator(`//p[normalize-space()='Log Out']`).click({ force: true });
  await page1.close();
});

test('Alpha_E2E_002: Verify that User Can View and Cancel an Order from the “My Orders” Section', async () => {
  // Setup and Login
  const page1 = await context.newPage();
  await page1.goto('http://demo.alphabin.co');
  await abPlaywright.setupLogging(page1);
  await page1.locator("//button[contains(@class, 'flex') and contains(@class, 'justify-center') and contains(@class, 'lg:hidden')]").click({ force: true });
  await page1.locator(locators['SVG Path inside SVG'], { description: descriptions['SVG Path inside SVG'] }).click({ force: true });
  await page1.locator(locators['Input with name email'], { description: descriptions['Input with name email'] }).click({ force: true });
  await page1.locator(locators['Input with name email'], { description: descriptions['Input with name email'] }).fill(`test01@gmail.com`);
  await page1.locator(locators['Input with name password'], { description: descriptions['Input with name password'] }).click({ force: true });
  await page1.locator(locators['Input with name password'], { description: descriptions['Input with name password'] }).fill(`Test@12345`);
  await page1.locator(locators['Input with name password'], { description: descriptions['Input with name password'] }).press(`Enter`);

  // Navigate to Orders Section
  await page1.locator(locators['Button with Text Shop Now'], { description: descriptions['Button with Text Shop Now'] }).click({ force: true });
  await page1.locator(locators['SVG Path inside SVG'], { description: descriptions['SVG Path inside SVG'] }).click({ force: true });
  await page1.locator(locators['P with Text Track and manage your orders'], { description: descriptions['P with Text Track and manage your orders'] }).click({ force: true });

  // Verify Orders Section Visibility
  await expect(page1.locator(locators['Div_3'], { description: descriptions['Div_3'] })).toBeVisible();

  // View Order Details
  await page1.locator(locators['Button with Text View'], { description: descriptions['Button with Text View'] }).click({ force: true });
  await expect(page1.locator(locators['Html inside body_11'], { description: descriptions['Html inside body_11'] })).toBeVisible();

  // Scroll and Navigate Back
  await page1.mouse.wheel(1, 585);
  await page1.mouse.wheel(1, -569);
  await page1.mouse.wheel(1, -15);
  await page1.locator(locators['Button with Text Back to home'], { description: descriptions['Button with Text Back to home'] }).click({ force: true });

  // Navigate to My Orders Section
  await page1.locator(locators['SVG Path inside SVG'], { description: descriptions['SVG Path inside SVG'] }).click({ force: true });
  await page1.locator(locators['P with Text My Orders'], { description: descriptions['P with Text My Orders'] }).click({ force: true });

  // Cancel Order
  await page1.locator(locators['Button with Text Cancel_1'], { description: descriptions['Button with Text Cancel_1'] }).click({ force: true });
  await expect(page1.locator(locators['Div_2'], { description: descriptions['Div_2'] })).toBeVisible();
  await page1.locator(locators['Button with Text Yes Cancel Order'], { description: descriptions['Button with Text Yes Cancel Order'] }).click({ force: true });

  // Verify Order Cancellation
  await expect(page1.locator(locators['Div with Text Order cancelled successfully'], { description: descriptions['Div with Text Order cancelled successfully'] })).toBeVisible();

  // Cleanup
  await page1.close();
});