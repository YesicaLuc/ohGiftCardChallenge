class ModelPage {
  visit(modelId: string) {
    cy.visit(`/model/${modelId}`);
  }

  votesCount() {
    return cy.get('.card-block h4 strong');
  }

  vote(comment: string) {
    cy.get('#comment').type(comment);
    cy.contains('button', 'Vote!').click();
  }

  thankYouMessage() {
    return cy.contains('p.card-text', 'Thank you for your vote!');
  }

  commentRow(comment: string) {
    return cy.contains('table tbody tr', comment);
  }
}

export const modelPage = new ModelPage();
