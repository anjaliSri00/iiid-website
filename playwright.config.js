// // playwright.config.js
// const { defineConfig, devices } = require('@playwright/test');
// require('dotenv').config({ path: '.env.test' });  // Load test environment

// module.exports = defineConfig({
//   testDir: './tests/e2e',
//   testMatch: '**/*.spec.js',
  
//   // Global timeout
//   timeout: parseInt(process.env.TEST_TIMEOUT) || 30000,
  
//   // Retries
//   retries: parseInt(process.env.TEST_RETRIES) || 2,
  
//   // Workers
//   workers: parseInt(process.env.TEST_WORKERS) || 4,
  
//   use: {
//     // BASE_URL for frontend navigation
//     baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
//     // Additional environment variables available in tests
//     extraHTTPHeaders: {
//       'X-Test-Environment': 'true',
//     },
    
//     trace: 'on-first-retry',
//     screenshot: 'only-on-failure',
//     video: 'retain-on-failure',
//   },
  
//   projects: [
//     {
//       name: 'chromium',
//       use: { ...devices['Desktop Chrome'] },
//     },
//     {
//       name: 'firefox',
//       use: { ...devices['Desktop Firefox'] },
//     },
//     {
//       name: 'webkit',
//       use: { ...devices['Desktop Safari'] },
//     },
//   ],
  
//   // Start Next.js dev server before tests
//   webServer: {
//     command: 'npm run dev',
//     url: process.env.BASE_URL || 'http://localhost:3000',
//     reuseExistingServer: !process.env.CI,
//     timeout: 120 * 1000,
//   },
// });


// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config({ path: '.env.test' });

module.exports = defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.js',
  
  // Increase global timeout
  timeout: 60000,
  
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results.json' }]
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 30000,
    actionTimeout: 15000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Firefox specific settings
        launchOptions: {
          firefoxUserPrefs: {
            'dom.disable_beforeunload': true,
          },
        },
      },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: process.env.BASE_URL || 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
});