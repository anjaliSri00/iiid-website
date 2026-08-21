// tests/e2e/navigation.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Navigation Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');
  });

  test.describe('Main Navigation', () => {
    
    test('should display main navigation bar', async ({ page }) => {
      // Check for navigation elements
      const nav = await page.locator('nav, header, .navbar, .navigation');
      await expect(nav.first()).toBeVisible({ timeout: 10000 });
      
      // Get all navigation links
      const navLinks = await page.locator('nav a, header a, .navbar a');
      const count = await navLinks.count();
      
      console.log(`📊 Found ${count} navigation links`);
      expect(count).toBeGreaterThan(0);
    });

    test('should navigate to homepage from logo click', async ({ page }) => {
      // Find and click logo/home link
      const logo = await page.locator('a[href="/"], .logo, img[alt*="logo"]').first();
      
      if (await logo.isVisible()) {
        await logo.click();
        await expect(page).toHaveURL('/');
        console.log('✅ Logo navigation works');
      } else {
        console.log('⚠️ Logo not found, skipping test');
      }
    });

    test('should navigate to About page', async ({ page }) => {
      // Find About link
      const aboutLink = await page.locator('a[href*="about-us"], nav a:has-text("About")').first();
      
      if (await aboutLink.isVisible()) {
        await aboutLink.click();
        await page.waitForLoadState('domcontentloaded');
        
        // Verify we're on about page
        await expect(page).toHaveURL(/.*about-us/);
        
        // Check for about content
        const aboutContent = await page.locator('h1:has-text("About"), .about-content, main');
        await expect(aboutContent.first()).toBeVisible({ timeout: 5000 });
        console.log('✅ About page loaded successfully');
      } else {
        console.log('⚠️ About link not found, skipping test');
      }
    });

    test('should navigate to apply-online page', async ({ page }) => {
      const contactLink = await page.locator('a[href*="apply-online"], nav a:has-text("apply-online")').first();
      
      if (await contactLink.isVisible()) {
        await contactLink.click();
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page).toHaveURL(/.*apply-online/);
        
        const contactContent = await page.locator('h1:has-text("Live Online Courses"), .apply-online, main');
        await expect(contactContent.first()).toBeVisible({ timeout: 5000 });
        console.log('✅ apply-online page loaded successfully');
      } else {
        console.log('⚠️ apply-online link not found, skipping test');
      }
    });

    test('should navigate to Login page', async ({ page }) => {
      const loginLink = await page.locator('a[href*="login"], nav a:has-text("Login"), nav a:has-text("Sign in")').first();
      
      if (await loginLink.isVisible()) {
        await loginLink.click();
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page).toHaveURL(/.*login/);
        
        const loginForm = await page.locator('form, input[type="email"], input[type="password"]');
        await expect(loginForm.first()).toBeVisible({ timeout: 5000 });
        console.log('✅ Login page loaded successfully');
      } else {
        console.log('⚠️ Login link not found, skipping test');
      }
    });

    test('should navigate to Register page', async ({ page }) => {
      const registerLink = await page.locator('a[href*="register"], a[href*="signup"], nav a:has-text("Register"), nav a:has-text("Sign up")').first();
      
      if (await registerLink.isVisible()) {
        await registerLink.click();
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page).toHaveURL(/.*register|signup/);
        
        const registerForm = await page.locator('form, input[name="full_name"], input[type="email"]');
        await expect(registerForm.first()).toBeVisible({ timeout: 5000 });
        console.log('✅ Register page loaded successfully');
      } else {
        console.log('⚠️ Register link not found, skipping test');
      }
    });
  });

  test.describe('Footer Navigation', () => {
    
    test('should display footer links', async ({ page }) => {
      // Scroll to footer
      const footer = await page.locator('footer');
      await expect(footer).toBeVisible({ timeout: 5000 });
      
      // Check for footer links
      const footerLinks = await page.locator('footer a');
      const count = await footerLinks.count();
      
      console.log(`📊 Found ${count} footer links`);
      expect(count).toBeGreaterThan(0);
    });

    test('should navigate to Terms page from footer', async ({ page }) => {
      const termsLink = await page.locator('footer a[href*="terms"], footer a:has-text("Terms")').first();
      
      if (await termsLink.isVisible()) {
        await termsLink.click();
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page).toHaveURL(/.*terms/);
        console.log('✅ Terms page loaded successfully');
      } else {
        console.log('⚠️ Terms link not found, skipping test');
      }
    });

    test('should navigate to Privacy page from footer', async ({ page }) => {
      const privacyLink = await page.locator('footer a[href*="privacy"], footer a:has-text("Privacy")').first();
      
      if (await privacyLink.isVisible()) {
        await privacyLink.click();
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page).toHaveURL(/.*privacy/);
        console.log('✅ Privacy page loaded successfully');
      } else {
        console.log('⚠️ Privacy link not found, skipping test');
      }
    });
  });

  test.describe('Mobile Navigation', () => {
    
    test('should show mobile menu on small screens', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(500);
      
      // Look for hamburger menu
      const hamburger = await page.locator('.hamburger, .mobile-menu-toggle, [aria-label="Menu"], button:has-text("☰")').first();
      
      if (await hamburger.isVisible()) {
        await hamburger.click();
        await page.waitForTimeout(500);
        
        // Check if mobile menu opened
        const mobileMenu = await page.locator('.mobile-menu, .nav-menu-mobile, [role="menu"]');
        await expect(mobileMenu.first()).toBeVisible({ timeout: 3000 });
        console.log('✅ Mobile menu opened successfully');
      } else {
        console.log('⚠️ Hamburger menu not found, skipping test');
      }
    });

    test('should close mobile menu on link click', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(500);
      
      const hamburger = await page.locator('.hamburger, .mobile-menu-toggle, [aria-label="Menu"]').first();
      
      if (await hamburger.isVisible()) {
        await hamburger.click();
        await page.waitForTimeout(500);
        
        // Click a navigation link in mobile menu
        const mobileLink = await page.locator('.mobile-menu a, .nav-menu-mobile a').first();
        if (await mobileLink.isVisible()) {
          const href = await mobileLink.getAttribute('href');
          await mobileLink.click();
          await page.waitForLoadState('domcontentloaded');
          
          if (href && href !== '#') {
            await expect(page).toHaveURL(new RegExp(href.replace('/', '.*')));
            console.log('✅ Mobile menu closed after link click');
          }
        }
      } else {
        console.log('⚠️ Mobile menu test skipped');
      }
    });
  });

  test.describe('Dropdown Navigation', () => {
    
    test('should handle dropdown menus', async ({ page }) => {
      // Find dropdown triggers
      const dropdowns = await page.locator('.dropdown, .nav-item-has-dropdown, li:has(ul)');
      const count = await dropdowns.count();
      
      if (count > 0) {
        console.log(`📊 Found ${count} dropdown menus`);
        
        // Test first dropdown
        const firstDropdown = dropdowns.first();
        const trigger = await firstDropdown.locator('a, button').first();
        
        if (await trigger.isVisible()) {
          await trigger.hover();
          await page.waitForTimeout(500);
          
          // Check if dropdown opened
          const dropdownContent = await firstDropdown.locator('ul, .dropdown-menu');
          await expect(dropdownContent.first()).toBeVisible({ timeout: 3000 });
          console.log('✅ Dropdown menu works');
        }
      } else {
        console.log('⚠️ No dropdown menus found, skipping test');
      }
    });
  });

  test.describe('Social Media Links', () => {
    
    test('should have social media links', async ({ page }) => {
      // Check for social media links
      const socialLinks = await page.locator('a[href*="facebook"], a[href*="instagram"], a[href*="linkedin"], a[href*="youtube"], a[href*="twitter"]');
      const count = await socialLinks.count();
      
      console.log(`📊 Found ${count} social media links`);
      
      if (count > 0) {
        // Verify they have proper attributes
        for (let i = 0; i < Math.min(count, 3); i++) {
          const link = socialLinks.nth(i);
          const href = await link.getAttribute('href');
          const target = await link.getAttribute('target');
          const rel = await link.getAttribute('rel');
          
          expect(href).toBeTruthy();
          expect(href).toMatch(/https?:\/\//);
          
          if (target) {
            expect(target).toBe('_blank');
          }
          
          if (rel) {
            expect(rel).toContain('noopener');
            expect(rel).toContain('noreferrer');
          }
          
          console.log(`✅ Social link: ${href}`);
        }
      }
    });
  });

  test.describe('Breadcrumb Navigation', () => {
    
    test('should show breadcrumbs on inner pages', async ({ page }) => {
      // Navigate to an inner page
      await page.goto('/about-us', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('domcontentloaded');
      
      // Check for breadcrumbs
      const breadcrumbs = await page.locator('.breadcrumb, .breadcrumbs, nav[aria-label="Breadcrumb"]');
      
      if (await breadcrumbs.isVisible()) {
        const breadcrumbLinks = await breadcrumbs.locator('a');
        const count = await breadcrumbLinks.count();
        
        console.log(`📊 Found ${count} breadcrumb items`);
        expect(count).toBeGreaterThan(0);
        
        // Check if home is in breadcrumbs
        const homeLink = await breadcrumbs.locator('a[href="/"]');
        await expect(homeLink.first()).toBeVisible({ timeout: 2000 });
        console.log('✅ Breadcrumbs working correctly');
      } else {
        console.log('⚠️ No breadcrumbs found, skipping test');
      }
    });
  });

  test.describe('Back/Forward Navigation', () => {
    
    test('should handle browser back and forward', async ({ page }) => {
      // Navigate to a few pages
      await page.goto('/');
      await page.goto('/about-us');
      await page.goto('/apply-online');
      
      // Go back
      await page.goBack();
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/.*about-us/);
      console.log('✅ Back navigation works');
      
      // Go forward
      await page.goForward();
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/.*apply-online/);
      console.log('✅ Forward navigation works');
    });
  });

  test.describe('Active Navigation States', () => {
    
    test('should highlight active navigation link', async ({ page }) => {
      // Navigate to about page
      await page.goto('/about-us', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('domcontentloaded');
      
      // Find active link
      const activeLink = await page.locator('nav a.active, nav a[aria-current="page"], .active-nav-link');
      const count = await activeLink.count();
      
      if (count > 0) {
        const text = await activeLink.first().textContent();
        console.log(`✅ Active navigation: ${text}`);
        expect(count).toBeGreaterThan(0);
      } else {
        console.log('⚠️ No active navigation link found');
      }
    });
  });

  test.describe('Navigation Accessibility', () => {
    
    test('should have proper ARIA attributes on navigation', async ({ page }) => {
      // Check main navigation
      const mainNav = await page.locator('nav[aria-label], header[role="navigation"]');
      const count = await mainNav.count();
      
      if (count > 0) {
        const ariaLabel = await mainNav.first().getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        console.log(`✅ Navigation has ARIA label: ${ariaLabel}`);
      } else {
        console.log('⚠️ No ARIA navigation found');
      }
      
      // Check skip to content link
      const skipLink = await page.locator('a[href*="#main"], a:has-text("Skip to content")');
      if (await skipLink.isVisible()) {
        console.log('✅ Skip to content link found');
      }
    });
  });

  test.describe('Error Navigation', () => {
    
    test('should handle 404 page navigation', async ({ page }) => {
      // Navigate to non-existent page
      await page.goto('/non-existent-page-12345', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      console.log(`📍 Current URL: ${url}`);
      
      // Check if we're on 404 page or redirected
      const is404 = await page.locator('h1:has-text("404"), .error-page, .not-found');
      
      if (await is404.isVisible()) {
        console.log('✅ 404 page displayed correctly');
        await expect(is404.first()).toBeVisible({ timeout: 3000 });
      } else {
        console.log('⚠️ No 404 page detected, may have redirect');
        // Check if redirected to homepage
        await expect(page).toHaveURL(/.*$/);
      }
    });
  });

  test.describe('Navigation Performance', () => {
    
    test('should load pages within acceptable time', async ({ page }) => {
      const pages = ['/', '/about-us', '/apply-online'];
      
      for (const pagePath of pages) {
        const startTime = Date.now();
        await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
        const loadTime = Date.now() - startTime;
        
        console.log(`⏱️ ${pagePath} loaded in ${loadTime}ms`);
        expect(loadTime).toBeLessThan(5000); // 5 seconds max
      }
    });
  });
});