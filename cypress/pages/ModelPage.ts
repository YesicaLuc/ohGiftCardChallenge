const selectors = {
  votesCount: '.card-block h4 strong',
  commentInput: '#comment',
  thankYouMessage: 'p.card-text',
  commentRows: 'table tbody tr',
};

class ModelPage {
  visit(modelId: string) {
    cy.visit(`/model/${encodeURIComponent(modelId)}`);
  }

  vote(comment: string) {
    cy.get(selectors.commentInput).type(comment);
    cy.contains('button', 'Vote!').click();
  }

  votesCount() {
    return cy.get(selectors.votesCount);
  }

  thankYouMessage() {
    return cy.contains(selectors.thankYouMessage, 'Thank you for your vote!');
  }

  commentRow(comment: string) {
    return cy.contains(selectors.commentRows, comment);
  }
}

export const modelPage = new ModelPage();
