describe("Wishlist Functionality", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/login");

    cy.get('input[type="email"]').type("savishka2@gmail.com");
    cy.get('input[type="password"]').type("Savishka@2025");
    cy.get('button[type="submit"]').click();

    cy.url().should("include", "/");

    cy.window().its('localStorage.token').should('exist');
  });

  it("should add an item to wishlist", () => {
    cy.visit("http://localhost:5173/client/dashboard/shops");

    cy.get(".shop-card").should("be.visible");

    cy.get(".shop-card").first().click();

    cy.get('[data-cy="add-wishlist-btn"]').should("be.visible");

    cy.get('[data-cy="add-wishlist-btn"]').first().click();
  });
});
