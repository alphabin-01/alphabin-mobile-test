const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Directory where your tests are located
  testDir: './test',

  timeout: 60000,

  use: {
    headless: false, 
    baseURL: 'http://demo.alphabin.co',
    viewport: { width: 412, height: 915 },
    launchOptions: {
      args: ['--window-size=412,915'],
    },
    screenshot: 'only-on-failure',
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  projects: [
    {
      // Android device
      name: 'Mobile Galaxy S20 Ultra',
      use: {
        ...devices['Galaxy S20 Ultra'],
        headless: false,
        viewport: { width: 412, height: 915 },
        launchOptions: {
          args: ['--window-size=412,915'],
        },
      },
    },
    {
      // IOS device
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        browserName: 'webkit',
        headless: false,
      },
    },
  ],

  // Generates an HTML report after test runs
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
});
