# Mobile Test Automation Project

[![Watch the demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

This project provides automated end-to-end (E2E) tests for mobile web applications using [Playwright](https://playwright.dev/). It is pre-configured to emulate real mobile devices (Android and iOS) and includes custom browser/context management, global locators, and element descriptions for robust and maintainable test scripts.

---

## Features

- 📱 **Mobile device emulation** (Android & iOS)
- 🧩 **Reusable locators and element descriptions**
- 🧪 **Custom browser/context factory**
- 📊 **HTML test reports**
- 🛠️ **Easy configuration and extension**

---

## Requirements

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- Internet access (for Playwright browser downloads)
- (Optional) [alphabin-pw](https://www.npmjs.com/package/alphabin-pw) package if used in your tests

---

## Installation

1. **Clone the repository:**

   ```sh
   git clone <your-repo-url>
   cd mobile-test
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

   > This will install Playwright and all required Node.js packages.

3. **Install Playwright browsers (if not already):**

   ```sh
   npx playwright install
   ```

4. **(Optional) Install `alphabin-pw` if your tests require it:**

   ```sh
   npm install alphabin-pw
   ```

---

## Configuration

- **Device Emulation:**  
  Devices and browsers are configured in `playwright.config.js` under the `projects` array.  
  Example devices: Galaxy S20 Ultra (Android), iPhone 12 (iOS).

- **Base URL:**  
  Set in `playwright.config.js` (`baseURL`).  
  Default: `http://demo.alphabin.co`

- **Headless Mode:**  
  By default, tests run in headed mode for visibility. Change `headless: false` to `true` in the config for CI/headless runs.

- **Custom Context:**  
  `BrowserFactory.js` provides advanced context creation and device emulation logic.

---

## Running Tests

To execute all tests:

```sh
npm test
```
or
```sh
npx playwright test
```

- To run a specific test file:
  ```sh
  npx playwright test test/mobile.spec.ts
  ```

- To run tests for a specific device/project:
  ```sh
  npx playwright test --project="Mobile Galaxy S20 Ultra"
  ```

- To open the HTML report after tests:
  ```sh
  npx playwright show-report
  ```

---

## Test Reports

- After running tests, an HTML report is generated in the `playwright-report/` directory.
- Open the report in your browser:
  ```sh
  npx playwright show-report
  ```

---

## Custom Utilities

- **BrowserFactory.js:**  
  Handles browser and context creation, device emulation, and custom page extensions (e.g., visual checks).

- **elementDescriptions.js & globalLocator.js:**  
  Centralized element descriptions and selectors for maintainable and readable test scripts.

---

## Troubleshooting

- **Browsers not installed:**  
  Run `npx playwright install` to download required browsers.

- **Missing dependencies:**  
  Run `npm install` to ensure all packages are installed.

- **alphabin-pw not found:**  
  If you see errors related to `alphabin-pw`, install it with `npm install alphabin-pw`.

- **Test failures:**  
  - Check the HTML report in `playwright-report/` for detailed error messages and screenshots.
  - Ensure the target site (`baseURL`) is accessible.

- **Environment variables:**  
  If using visual AI checks, you may need to set `MISTRAL_API_KEY` for API access.

---

## Acknowledgements

- [Playwright](https://playwright.dev/)
- [alphabin-pw](https://www.npmjs.com/package/alphabin-pw) (if used)
- Demo site: [demo.alphabin.co](http://demo.alphabin.co)

---