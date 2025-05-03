describe('Login Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should show error message for invalid credentials', () => {
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.get('.error').should('be.visible');
    cy.contains('Check your email & password!').should('be.visible');
  });

  it('should successfully login with valid credentials', () => {
    cy.get('input[type="email"]').type('savishka2@gmail.com');
    cy.get('input[type="password"]').type('Savishka@2025');
    cy.get('button[type="submit"]').click();

    cy.contains('Successfully Login!').should('be.visible');

    cy.url().should('include', '/');
  });

  it('should validate email format', () => {
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.get('input[type="email"]').should('have.attr', 'type', 'email');
  });

  it('should handle server unavailability gracefully', () => {
    cy.intercept('POST', 'http://localhost:3000/user/login', {
      statusCode: 500,
      body: {
        error: 'Internal Server Error'
      }
    }).as('loginRequest');

    cy.get('input[type="email"]').type('savishka2@gmail.com');
    cy.get('input[type="password"]').type('Savishka@2025');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');

    cy.get('.error').should('be.visible');
    cy.contains('Check your email & password!').should('be.visible');

    cy.url().should('include', '/login');
  });
});
