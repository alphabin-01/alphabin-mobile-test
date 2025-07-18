import { defineConfig, devices } from '@playwright/test';

module.exports = defineConfig({
  // Directory where your tests are located
  testDir: './test',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 5,
  reporter: [
    ['html', {
      outputFolder: 'playwright-report',
      open: 'never'
    }],
    ['blob', { outputDir: 'blob-report' }], // Use blob reporter
    ['json', { outputFile: './playwright-report/report.json' }],
      // ['@alphabin/trx', {

      //  // Required configuration
      //  serverUrl: 'https://staging-api.testdino.com',
      //  apiKey: 'trx_staging_96dde6aa397caba148106304889ae88a2a5339b4e0da54e64a8f2324e87ec73c',
   

      // // Optional: Custom tags
      // tags: [
      //   'automated',
      //   process.env.TEST_ENV || 'staging',
      //   process.env.BRANCH_NAME || 'main'
      // ],
    // }]
  ],
  timeout: 60000,

  use: {
    headless: true, 
    baseURL: 'http://demo.alphabin.co',
    viewport: { width: 412, height: 915 },
    launchOptions: {
      args: ['--window-size=412,915'],
    },
    screenshot: 'on',
    trace: 'on',
    video: 'on',
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
    // {
    //   // IOS device
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //     browserName: 'webkit',
    //     headless: false,
    //   },
    // },
  ],
});
