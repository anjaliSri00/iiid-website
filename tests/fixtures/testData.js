// tests/fixtures/testData.js
const testData = {
  users: {
    admin: {
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    },
    student: {
      email: 'user@example.com',
      password: 'user123',
      role: 'student'
    }
  },
  products: {
    sample: {
      name: 'Test Product',
      price: 99.99,
      category: 'Electronics'
    }
  },
  urls: {
    home: '/',
    about: '/about',
    // contact: '/contact',
    login: '/login',
    dashboard: '/dashboard'
  }
};

module.exports = testData;