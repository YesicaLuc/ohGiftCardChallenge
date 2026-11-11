// Formulario de login del header: está presente en todas las páginas del sitio.
// Los selectores se acotan a <my-login> porque la página de registro tiene otro campo name="password".
const selectors = {
  usernameInput: 'my-login input[name="login"]',
  passwordInput: 'my-login input[name="password"]',
  submitButton: 'my-login button[type="submit"]',
  errorMessage: 'my-login .label-warning',
  navLink: 'my-login .nav-link',
  link: 'my-login a',
};

class LoginForm {
  login(username: string, password: string) {
    this.usernameInput().type(username);
    cy.get(selectors.passwordInput).type(password);
    this.submit();
  }

  submit() {
    cy.get(selectors.submitButton).click();
  }

  logout() {
    this.logoutLink().click();
  }

  usernameInput() {
    return cy.get(selectors.usernameInput);
  }

  greeting() {
    return cy.contains(selectors.navLink, 'Hi,');
  }

  logoutLink() {
    return cy.contains(selectors.link, 'Logout');
  }

  errorMessage() {
    return cy.get(selectors.errorMessage);
  }
}

export const loginForm = new LoginForm();
