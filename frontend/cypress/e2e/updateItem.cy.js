describe('Update Item Flow with localStorage Auth', () => {
    let testItemId;
  
    before(() => {
      // Create test item using localStorage auth
      cy.login().then(() => {
        cy.window().then((win) => {
          
          cy.request({
            method: 'POST',
            url: 'http://localhost:3000/inventory/add-item',
            headers: {
              Authorization: `Bearer ${user?.token}`
            },
            body: {
              name: `Test Item ${Date.now()}`,
              price: 2000,
              quantity: 5,
              description: 'Initial test item',
              category: 'Electronics',
              image: 'https://via.placeholder.com/150'
            }
          }).then((response) => {
            testItemId = response.body._id;
          });
        });
      });
    });
  
    it('Should update item using localStorage auth', () => {
      // Force localStorage persistence between pages
      cy.login().then(() => {
        cy.window().then((win) => {
          // Get auth data directly from localStorage
          const user = JSON.parse(win.localStorage.getItem('user'));
          
          // Visit update page with localStorage context
          cy.visit(`http://localhost:5173/shopOwner/dashboard/update-item/${testItemId}`, {
            onBeforeLoad: (win) => {
              win.localStorage.setItem('user', JSON.stringify(user));
            }
          });
  
          // Verify auth state before proceeding
          cy.window().its('localStorage.user').should('exist');
          
          // Intercept item load request
          cy.intercept('GET', `http://localhost:3000/inventory/get-item/${testItemId}`).as('getItem');
          cy.wait('@getItem').its('response.statusCode').should('eq', 200);
  
          // Perform update
          cy.get('[data-cy=item-price]').clear().type('3500');
          cy.intercept('PATCH', `http://localhost:3000/inventory/update-item/${testItemId}`).as('updateItem');
          cy.get('[data-cy=submit-item]').click();
  
          // Verify update
          cy.wait('@updateItem').should((interception) => {
            expect(interception.response.statusCode).to.eq(200);
            expect(interception.response.body.price).to.eq(3500);
          });
  
          // Verify UI feedback
          cy.get('[data-cy=success-toast]').should('be.visible');
        });
      });
    });
  
    after(() => {
      // Cleanup using localStorage auth
      cy.window().then((win) => {
        const user = JSON.parse(win.localStorage.getItem('user'));
        
        cy.request({
          method: 'DELETE',
          url: `http://localhost:3000/inventory/delete-item/${testItemId}`,
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
      });
    });
  });