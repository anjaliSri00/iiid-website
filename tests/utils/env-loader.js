// tests/utils/env-loader.js
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envFile = path.resolve(process.cwd(), '.env.test');
dotenv.config({ path: envFile });

// Debug: Log loaded variables (remove in production)
console.log('=== Environment Variables Loaded ===');
console.log('BASE_URL:', process.env.BASE_URL);
console.log('API_URL:', process.env.API_URL);
console.log('TEST_EMAIL:', process.env.TEST_EMAIL);
console.log('TEST_PASSWORD:', process.env.TEST_PASSWORD ? '***' : 'NOT SET');
console.log('====================================');

module.exports = process.env;