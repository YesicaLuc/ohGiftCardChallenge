import type { User } from '../support/factories/user';

const selectors = {
  username: '#username',
  firstName: '#firstName',
  lastName: '#lastName',
  password: '#password',
  confirmPassword: '#confirmPassword',
  successMessage: '.result.alert-success',
};

class RegisterPage {
  visit() {
    cy.visit('/register');
  }

  fillForm(user: User) {
    cy.get(selectors.username).type(user.username);
    cy.get(selectors.firstName).type(user.firstName);
    cy.get(selectors.lastName).type(user.lastName);
    cy.get(selectors.password).type(user.password);
    cy.get(selectors.confirmPassword).type(user.password);
  }

  submit() {
    cy.contains('button', 'Register').click();
  }

  successMessage() {
    return cy.get(selectors.successMessage);
  }
}

export const registerPage = new RegisterPage();
