type User = { username: string; firstName: string; lastName: string; password: string };

class RegisterPage {
  visit() {
    cy.visit('/register');
  }

  fillForm(user: User) {
    cy.get('#username').type(user.username);
    cy.get('#firstName').type(user.firstName);
    cy.get('#lastName').type(user.lastName);
    cy.get('#password').type(user.password);
    cy.get('#confirmPassword').type(user.password);
  }

  submit() {
    cy.contains('button', 'Register').click();
  }

  successMessage() {
    return cy.get('.result.alert-success');
  }
}

export const registerPage = new RegisterPage();
