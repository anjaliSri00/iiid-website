// tests/page-objects/loginPage.js
const BasePage = require('./basePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    // Selectors
    this.emailInput = '#email';
    this.passwordInput = '#password';
    this.loginButton = 'button[type="submit"]';
    this.errorMessage = '.error-message';
    this.forgotPasswordLink = 'a[href*="forgot-password"]';
  }

  async login(email, password) {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }

  async getErrorMessage() {
    return await this.getText(this.errorMessage);
  }

  async isLoginButtonVisible() {
    return await this.page.isVisible(this.loginButton);
  }
}

module.exports = LoginPage;