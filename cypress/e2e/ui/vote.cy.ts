import { buildUser } from '../../support/factories/user';
import { modelPage } from '../../pages/ModelPage';

const DIABLO_MODEL_ID = 'ckl2phsabijs71623vk0%7Cckl2phsabijs71623vqg';

describe('Buggy Cars - Votación', () => {
  it('Votar un modelo dejando un comentario', () => {
    const user = buildUser();
    const comment = `Test comment ${Date.now()}`;

    cy.visit('/'); // el runner interactivo necesita una página cargada antes de los requests (no afecta el running por consola)
    cy.registerUserByApi(user);
    cy.loginByApi(user);

    cy.intercept('GET', '**/models/*').as('getModel');
    cy.intercept('POST', '**/models/*/vote').as('vote');

    modelPage.visit(DIABLO_MODEL_ID);
    cy.wait('@getModel');

    modelPage
      .votesCount()
      .invoke('text')
      .then((text) => {
        const initialVotes = Number(text.trim());

        // Alias nuevo: captura solo la recarga del modelo que la app hace después de votar
        cy.intercept('GET', '**/models/*').as('getModelAfterVote');

        modelPage.vote(comment);
        cy.wait('@vote').its('response.statusCode').should('eq', 200);
        cy.wait('@getModelAfterVote');

        // 1. El voto se registra
        modelPage.thankYouMessage().should('be.visible');
        modelPage.votesCount().should('have.text', String(initialVotes + 1));

        // 2. Reviso que el backend guardo el comentario
        cy.request(`${Cypress.expose('buggyApiUrl')}/models/${DIABLO_MODEL_ID}`)
          .its('body.comments')
          .then((comments: { text: string }[]) => {
            const saved = comments.some((c) => c.text === comment);
            expect(saved, 'el backend guardó el comentario').to.eq(true);
          });

        // 3. La pantalla muestra el comentario
        modelPage.commentRow(comment).should('be.visible');
      });
  });
});
