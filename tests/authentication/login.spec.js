// tests/e2e/authentication/login.spec.js
const { test, expect } = require('@playwright/test');
const LoginPage = require('../../page-objects/loginPage');

test.describe('Login Functionality', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate('/login');
  });

  test('should login with valid credentials', async ({ page }) => {
    await loginPage.login('test@example.com', 'password123');
    
    // Wait for redirect
    await page.waitForURL('**/dashboard');
    
    // Verify successful login
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Check for user profile element
    const userProfile = await page.locator('.user-profile');
    await expect(userProfile).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await loginPage.login('invalid@example.com', 'wrongpass');
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid credentials');
  });

  test('should validate email field', async ({ page }) => {
    await loginPage.login('invalid-email', 'password123');
    
    const emailError = await page.locator('#email-error');
    await expect(emailError).toBeVisible();
    await expect(emailError).toContain('Please enter a valid email');
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await loginPage.click(loginPage.forgotPasswordLink);
    
    await expect(page).toHaveURL(/.*forgot-password/);
  });
});