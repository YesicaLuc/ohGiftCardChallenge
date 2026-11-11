import { buildUser } from '../../support/factories/user';
import { registerPage } from '../../pages/RegisterPage';
import { loginForm } from '../../pages/LoginForm';

describe('Buggy Cars - Registro y login', () => {
  it('Registrar un usuario nuevo', () => {
    const user = buildUser();

    registerPage.visit();
    registerPage.fillForm(user);
    registerPage.submit();

    registerPage.successMessage().should('contain.text', 'Registration is successful');
  });

  it('Iniciar sesión con un usuario recién creado', () => {
    const user = buildUser();
    cy.registerUserByApi(user);

    cy.visit('/');
    loginForm.login(user.username, user.password);

    loginForm.greeting().should('contain.text', `Hi, ${user.firstName}`);
    cy.contains('my-login a', 'Logout').should('be.visible');
  });

  it('Cerrar sesión', () => {
    const user = buildUser();
    cy.visit('/');
    cy.registerUserByApi(user);
    cy.loginByApi(user);

    cy.visit('/');
    loginForm.greeting().should('be.visible');

    loginForm.logout();

    loginForm.greeting().should('not.exist');
    cy.get('my-login input[name="login"]').should('be.visible');
  });

  it('Mostrar error al iniciar sesión con credenciales inválidas', () => {
    cy.visit('/');
    loginForm.login(buildUser().username, 'Invalid1!');

    loginForm.errorMessage().should('contain.text', 'Invalid username/password');
  });

  it('No iniciar sesión con los campos vacíos', () => {
    cy.intercept('POST', '**/oauth/token').as('loginRequest');
    cy.visit('/');

    loginForm.submit();

    // El navegador bloquea el envío: el campo queda marcado como obligatorio vacío
    loginForm.loginInput().invoke('prop', 'validity').its('valueMissing').should('eq', true);
    loginForm.loginInput().invoke('prop', 'validationMessage').should('not.be.empty');

    // No se envió ningún request de login y no hay sesión
    cy.get('@loginRequest.all').should('have.length', 0);
    loginForm.greeting().should('not.exist');
  });
});
