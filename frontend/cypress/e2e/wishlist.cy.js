// cypress/e2e/wishlist.cy.js

describe('Wishlist Functionality', () => {
    let testItemId;
    const testUser = {
      email: 'ishan@gmail.com',
      password: 'Ishan@123'
    };
  
    before(() => {
      // Login and get test item
      cy.login(testUser.email, testUser.password);
      cy.request('GET', 'http://localhost:3000/home/all-owners')
        .then((response) => {
          const shopId = response.body[0]?._id;
          return cy.request(`GET', 'http://localhost:3000/home/owner-items/${shopId}`);
        })
        .then((response) => {
          testItemId = response.body[0]?._id;
        });
    });
  
    it('Should add and display items in wishlist', () => {
      // Intercept API calls
      cy.intercept('POST', 'http://localhost:3000/api/wishlist/add-item').as('addToWishlist');
      cy.intercept('GET', 'http://localhost:3000/api/wishlist/read').as('getWishlist');
  
      // Navigate to item details
      cy.visit(`http://localhost:5173/client/dashboard/view-item/${testItemId}`);
  
      // Add to wishlist
      cy.get('[data-cy=add-wishlist-btn]')
        .should('exist')
        .click();
  
      // Verify API call
      cy.wait('@addToWishlist').its('response.statusCode').should('eq', 200);
  
      // Navigate to wishlist
      cy.visit('http://localhost:5173/client/dashboard/wishlist');
      cy.wait('@getWishlist');
  
      // Verify item exists
      cy.get('[data-cy=wishlist-item]')
        .should('exist')
        .should('contain', testItemId);
    });
  
    after(() => {
      // Cleanup test data
      if (testItemId) {
        cy.request({
          method: 'DELETE',
          url: `http://localhost:3000/api/wishlist/delete-item/${testItemId}`,
          headers: {
            Authorization: `Bearer ${Cypress.env('AUTH_TOKEN')}`
          }
        });
      }
    });
  });