// tests/utils/api-client.js
class ApiClient {
  constructor(request) {
    this.request = request;
    this.baseUrl = process.env.API_URL || 'http://localhost:8008';
    this.token = null;
    this.isAvailable = false;
  }

  async checkAvailability() {
    try {
      const response = await this.request.get(`${this.baseUrl}/health`, {
        timeout: 5000
      });
      this.isAvailable = response.ok();
      return this.isAvailable;
    } catch (error) {
      console.error(`❌ API not available at ${this.baseUrl}`);
      this.isAvailable = false;
      return false;
    }
  }

  async get(endpoint, options = {}) {
    if (!this.isAvailable) {
      throw new Error('API is not available');
    }
    
    const url = `${this.baseUrl}${endpoint}`;
    return await this.request.get(url, {
      headers: this.getHeaders(),
      ...options
    });
  }

  async post(endpoint, data, options = {}) {
    if (!this.isAvailable) {
      throw new Error('API is not available');
    }
    
    const url = `${this.baseUrl}${endpoint}`;
    return await this.request.post(url, {
      headers: this.getHeaders(),
      data: data,
      ...options
    });
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async login(email, password) {
    try {
      const response = await this.post('/auth/login', { email, password });
      if (response.ok()) {
        const data = await response.json();
        this.token = data.token;
        return data;
      }
      throw new Error('Login failed');
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  }
}

module.exports = ApiClient;