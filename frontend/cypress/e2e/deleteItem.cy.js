describe('Delete Item Flow', () => {
    let initialItemCount;
  
    beforeEach(() => {
      cy.login();
      cy.visit('/shopOwner/dashboard/view-items');
      cy.get('[data-cy=delete-item]').then(($el) => {
        initialItemCount = $el.length;
      });
    });
  
    it('Deletes an item', () => {
      cy.get('[data-cy=delete-item]').first().click();
      cy.on('window:confirm', () => true);
      cy.get('[data-cy=delete-item]').should('have.length.lessThan', initialItemCount);
      cy.contains('Item deleted successfully').should('be.visible');
    });
  });