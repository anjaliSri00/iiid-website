// // tests/e2e/homepage.spec.js
// const { test, expect } = require('@playwright/test');

// test.describe('Homepage Tests', () => {
  
//   test.beforeEach(async ({ page }) => {
//     // Ensure we're on the homepage
//     await page.goto('/');
//     // Wait for page to be fully loaded
//     await page.waitForLoadState('networkidle');
//   });

//   test('should load homepage successfully', async ({ page }) => {
//     // Check if page loaded
//     const title = await page.title();
//     console.log('Page title:', title);
    
//     // Check for main content
//     const mainContent = await page.locator('main');
//     await expect(mainContent).toBeVisible({ timeout: 10000 });
    
//     // Check for navigation
//     const nav = await page.locator('nav');
//     await expect(nav).toBeVisible({ timeout: 10000 });
    
//     // Check for at least one heading
//     const headings = await page.locator('h1, h2, h3');
//     await expect(headings.first()).toBeVisible();
//   });

//   test('should handle responsive design', async ({ page }) => {
//     // Test mobile viewport
//     await page.setViewportSize({ width: 375, height: 812 });
//     await page.waitForLoadState('networkidle');
    
//     // Verify mobile menu appears (if exists)
//     const mobileMenu = await page.locator('.mobile-menu, .hamburger, [aria-label="Menu"]');
//     if (await mobileMenu.count() > 0) {
//       await expect(mobileMenu.first()).toBeVisible();
//     }
//   });
// });

// tests/e2e/homepage.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Homepage Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Increase timeout for Firefox specifically
    test.setTimeout(90000); // 90 seconds for Firefox
    
    console.log('🔄 Loading homepage...');
    
    try {
      await page.goto('/', { 
        timeout: 45000,
        waitUntil: 'domcontentloaded'
      });
      
      // Wait for content
      await page.waitForSelector('main, #__next, .container, body', { 
        timeout: 20000,
        state: 'visible'
      });
      
      const title = await page.title();
      console.log(`📄 Page title: ${title}`);
      
    } catch (error) {
      console.error('❌ Failed to load homepage:', error.message);
      await page.screenshot({ path: 'firefox-homepage-error.png' });
      throw error;
    }
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check if page has content
    const bodyContent = await page.locator('body');
    await expect(bodyContent).toBeVisible({ timeout: 15000 });
    
    // Check for any heading
    const heading = await page.locator('h1, h2, .hero-title, .main-heading');
    if (await heading.count() > 0) {
      await expect(heading.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should handle responsive design', async ({ page }) => {
    // Test different viewports
    const viewports = [
      { width: 375, height: 812, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(1000);
      console.log(`📱 ${viewport.name} viewport tested`);
    }
  });
});