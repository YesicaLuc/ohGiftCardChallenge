import type { User } from './factories/user';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      registerUserByApi(user: User): Chainable<void>;
      loginByApi(user: User): Chainable<void>;
    }
  }
}

Cypress.Commands.add('registerUserByApi', (user: User) => {
  cy.request('POST', `${Cypress.expose('buggyApiUrl')}/users`, {
    ...user,
    confirmPassword: user.password,
  })
    .its('status')
    .should('eq', 201);
});

Cypress.Commands.add('loginByApi', (user: User) => {
  cy.session(user.username, () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.expose('buggyApiUrl')}/oauth/token`,
      form: true,
      body: { grant_type: 'password', username: user.username, password: user.password },
    }).then((res) => {
      expect(res.status).to.eq(200);
      cy.visit('/', {
        onBeforeLoad(win) {
          // La app lee la sesión de localStorage 'token' al iniciar (AuthApiService.getToken)
          win.localStorage.setItem('token', res.body.access_token);
        },
      });
    });
  });
});
