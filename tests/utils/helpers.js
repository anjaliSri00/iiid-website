// tests/utils/helpers.js
const { test } = require('@playwright/test');

// Custom test functions
async function loginUser(page, email, password) {
  await page.goto('/login');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}

async function waitForNetworkIdle(page, timeout = 10000) {
  await page.waitForLoadState('networkidle', { timeout });
}

// Data generators
function generateRandomEmail() {
  const random = Math.random().toString(36).substring(2, 10);
  return `test_${random}@example.com`;
}

function generateRandomString(length = 10) {
  return Math.random().toString(36).substring(2, 2 + length);
}

module.exports = {
  loginUser,
  waitForNetworkIdle,
  generateRandomEmail,
  generateRandomString
};