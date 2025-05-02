describe("Add Item Flow", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("http://localhost:5173/shopOwner/dashboard/add-item");
  });

  it("Adds a new item successfully", () => {
    // Intercept API calls
    cy.intercept("POST", "http://localhost:3000/inventory/add-item").as("addItem");
    cy.intercept("POST", "https://firebasestorage.googleapis.com/**").as("firebaseUpload");

    // Fill form
    cy.get("[data-cy=item-name]").type("Cypress Test Chair");
    cy.get("[data-cy=item-quantity]").type("5");
    cy.get("[data-cy=item-price]").type("2500");
    cy.get("[data-cy=item-description]").type("Ergonomic office chair");

    // Upload image
    cy.get("input[type=file]").selectFile("cypress/fixtures/test-image.jpg");
    cy.contains("Uploading...").should("not.exist");

    // Submit form
    cy.get("[data-cy=submit-item]").click();

    // Wait for API calls
    cy.wait("@firebaseUpload", { timeout: 15000 });
    cy.wait("@addItem");

    // Verify navigation after toast
    cy.location("pathname", { timeout: 15000 })
      .should("eq", "/shopOwner/dashboard/view-items");
  });
});
