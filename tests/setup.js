// tests/e2e/setup.js
const { test, expect } = require('@playwright/test');

// Global setup before all tests
test.beforeAll(async ({ request }) => {
  console.log('=== Test Setup ===');
  
  // Check if backend API is running
  const apiUrl = process.env.API_URL || 'http://localhost:8008';
  try {
    const response = await request.get(`${apiUrl}/health`, {
      timeout: 5000
    });
    if (response.ok()) {
      console.log('✅ Backend API is running');
    } else {
      console.log('⚠️ Backend API is running but returned:', response.status());
    }
  } catch (error) {
    console.log('⚠️ Backend API is not running. Some tests may be skipped.');
  }
  
  // Check if frontend is accessible
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  try {
    const response = await request.get(baseUrl);
    if (response.ok()) {
      console.log('✅ Frontend is running');
    } else {
      console.log('⚠️ Frontend returned:', response.status());
    }
  } catch (error) {
    console.log('❌ Frontend is not running!');
    console.log('Please start Next.js with: npm run dev');
  }
});

// Global teardown after all tests
test.afterAll(async () => {
  console.log('=== Test Teardown ===');
});