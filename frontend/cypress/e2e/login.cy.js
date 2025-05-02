describe('Login Tests', () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit('/login');
  });

  it('should show error message for invalid credentials', () => {
    // Test with invalid credentials
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Check for error message
    cy.get('.error').should('be.visible');
    cy.contains('Check your email & password!').should('be.visible');
  });

  it('should successfully login with valid credentials', () => {
    // Test with valid credentials
    cy.get('input[type="email"]').type('savishka2@gmail.com');
    cy.get('input[type="password"]').type('Savishka@2025');
    cy.get('button[type="submit"]').click();

    // Check for success message
    cy.contains('Successfully Login!').should('be.visible');

    // Verify redirection based on user type
    cy.url().should('include', '/');
  });

  it('should validate email format', () => {
    // Test with invalid email format
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Check for email validation error
    cy.get('input[type="email"]').should('have.attr', 'type', 'email');
  });

  it('should handle server unavailability gracefully', () => {
    // Intercept the login API call and simulate server error
    cy.intercept('POST', 'http://localhost:3000/user/login', {
      statusCode: 500,
      body: {
        error: 'Internal Server Error'
      }
    }).as('loginRequest');

    // Attempt to login
    cy.get('input[type="email"]').type('savishka2@gmail.com');
    cy.get('input[type="password"]').type('Savishka@2025');
    cy.get('button[type="submit"]').click();

    // Wait for the intercepted request
    cy.wait('@loginRequest');

    // Verify error message is displayed
    cy.get('.error').should('be.visible');
    cy.contains('Check your email & password!').should('be.visible');

    // Verify user stays on login page
    cy.url().should('include', '/login');
  });
});
