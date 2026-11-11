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
   //registrar por api

    loginForm.login(user.username, user.password);

    loginForm.greeting().should('contain.text', `Hi, ${user.firstName}`);
    cy.contains('my-login a', 'Logout').should('be.visible');
  });

  it('Mostrar error al iniciar sesión con credenciales inválidas', () => {
    cy.visit('/');
    loginForm.login(buildUser().username, 'Invalid1!');

    loginForm.errorMessage().should('contain.text', 'Invalid username/password');
  });
});