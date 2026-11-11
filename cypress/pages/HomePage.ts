class HomePage {
  visit() {
    cy.visit('/');
  }
}

export const homePage = new HomePage();
