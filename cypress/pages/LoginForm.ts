class LoginForm {
  login(username: string, password: string) {
    cy.get('my-login input[name="login"]').type(username);
    cy.get('my-login input[name="password"]').type(password);
    cy.get('my-login button[type="submit"]').click();
  }

  greeting() {
    return cy.contains('my-login .nav-link', 'Hi,');
  }

  errorMessage() {
    return cy.get('my-login .label-warning');
  }

  logout() {
    cy.contains('my-login a', 'Logout').click();
  }

  loginInput() {
    return cy.get('my-login input[name="login"]');
  }

  submit() {
    cy.get('my-login button[type="submit"]').click();
  }
}

export const loginForm = new LoginForm();
