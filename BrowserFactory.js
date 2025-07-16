const { chromium, firefox, webkit, devices } = require('@playwright/test');
const config = require('./playwright.config.js');
const path = require('path');
const fs = require('fs');

class BrowserFactory {
  static async createBrowserWithContext(projectName, contextOptions = {}) {
    let browser;
    let context;

    // Support both direct and default-nested use property
    const useConfig = config.use || config.default?.use || {};
    const isHeadless = useConfig.headless !== false;

    const launchOptions = {
      ...useConfig.launchOptions,
      headless: isHeadless,
      args: [
        ...(useConfig.launchOptions?.args || []),
        '--window-size=480,800',
      ],
    };

    // Pick which browser to launch (from your config)
    let browserName = 'chromium'; 
    const projectConfig = config.projects.find(p => p.name === projectName);
    if (projectConfig?.use?.browserName) {
      browserName = projectConfig.use.browserName;
    }

    switch (browserName.toLowerCase()) {
      case 'chromium':
        browser = await chromium.launch(launchOptions);
        break;
      case 'firefox':
        browser = await firefox.launch(launchOptions);
        break;
      case 'webkit':
        browser = await webkit.launch(launchOptions);
        break;
      default:
        throw new Error(`Unsupported browser: ${browserName}`);
    }

    // ✅ If the project is a known device, apply the device descriptor
    let deviceSettings = {};
    if (projectConfig?.use) {
      if (projectConfig.use.deviceScaleFactor || projectConfig.use.viewport) {
        deviceSettings = projectConfig.use; // Playwright already has it
      } else if (projectConfig.use.name && devices[projectConfig.use.name]) {
        deviceSettings = devices[projectConfig.use.name];
      }
    }

    // Merge device settings + custom context options
    let browserContextOptions = {
      ...deviceSettings,
      ...contextOptions,
    };

    // ✅ Apply permissions if needed
    if (browserName.toLowerCase() === 'chromium') {
      browserContextOptions.permissions = [
        ...(browserContextOptions.permissions || []),
        'clipboard-read',
        'clipboard-write',
      ];
    }

    // ✅ IMPORTANT: For mobile emulation, do NOT force a large desktop viewport
    if (!deviceSettings.viewport) {
      // Desktop fallback
      browserContextOptions.viewport = { width: 480, height: 800 };
    }

    context = await browser.newContext(browserContextOptions);

    const originalNewPage = context.newPage.bind(context);
    context.newPage = async function () {
      const page = await originalNewPage();
      BrowserFactory.extendPage(page);
      return page;
    };

    return { context };
  }

  static extendPage(page) {
    page.aiVisualCheck = async function (
      screenshotName,
      confidence_threshold = 0.8,
      timeout = 1000,
      testInfo
    ) {
      try {
        const screenshotPath = path.resolve('./screenshots', screenshotName);
        console.log(`Reference screenshot path: ${screenshotPath}`);
        if (!fs.existsSync(screenshotPath)) {
          console.warn(`Reference screenshot not found: ${screenshotPath}`);
          const screenshotDir = path.dirname(screenshotPath);
          if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
          }
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(timeout);
          await page.screenshot({ path: screenshotPath });
          console.log(`Created new reference screenshot: ${screenshotPath}`);
          return {
            differences: [],
            elementValidations: [],
            layoutAssessment: {
              alignmentIssues: [],
              spacingIssues: [],
              responsiveIssues: [],
            },
            confidence: 1.0,
          };
        }

        console.log(`Performing visual check with reference: ${screenshotPath}`);

        const currentDir = path.resolve('./screenshots/current');
        if (!fs.existsSync(currentDir)) {
          fs.mkdirSync(currentDir, { recursive: true });
        }

        const currentScreenshotPath = path.join(
          currentDir,
          `current_${Date.now()}.png`
        );
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(timeout);
        await page.screenshot({ path: currentScreenshotPath });

        const referenceImage = fs.readFileSync(screenshotPath).toString('base64');
        const currentImage = fs.readFileSync(currentScreenshotPath).toString(
          'base64'
        );

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${
              process.env.MISTRAL_API_KEY || 'RY9n4lZWgWmjrWLS36G8vHBTFFjjG2Bm'
            }`,
          },
          body: JSON.stringify({
            model: 'mistral-small-latest',
            temperature: 0.7,
            max_tokens: 800,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Compare these two images... [TRUNCATED FOR BREVITY]`,
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/png;base64,${referenceImage}`,
                    },
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/png;base64,${currentImage}`,
                    },
                  },
                ],
              },
            ],
            response_format: {
              type: 'json_object',
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const analysisResult = await response.json();
        const content = JSON.parse(analysisResult.choices[0].message.content);

        const result = {
          differences: content.differences || [],
          elementValidations: content.element_validations || [],
          layoutAssessment: content.layout_assessment || {
            alignmentIssues: [],
            spacingIssues: [],
            responsiveIssues: [],
          },
          confidence: content.confidence_score || 0,
        };

        console.log(`Completed visual comparison with confidence: ${result.confidence}`);

        if (testInfo) {
          const reportPath = path.join(
            testInfo.outputDir,
            `visual-check-${Date.now()}.json`
          );
          fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));

          await testInfo.attach('visual-comparison-results', {
            path: reportPath,
            contentType: 'application/json',
          });
          await testInfo.attach('reference-screenshot', {
            path: screenshotPath,
            contentType: 'image/png',
          });
          await testInfo.attach('current-screenshot', {
            path: currentScreenshotPath,
            contentType: 'image/png',
          });

          if (result.differences.length > 0) {
            testInfo.annotations.push({
              type: 'visual-differences',
              description: `Found ${result.differences.length} visual differences`,
            });
          }
          if (result.confidence < confidence_threshold) {
            testInfo.annotations.push({
              type: 'low-confidence',
              description: `Visual comparison confidence: ${result.confidence}`,
            });
          }
        }

        if (result.confidence < confidence_threshold) {
          throw new Error(
            `Visual comparison failed: Confidence score ${result.confidence} is below threshold ${confidence_threshold}`
          );
        }

        return result;
      } catch (error) {
        console.error('Error during visual check:', error);
        throw error;
      }
    };

    return page;
  }
}

module.exports = BrowserFactory;
