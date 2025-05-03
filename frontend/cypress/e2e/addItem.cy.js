describe("Add Item Flow", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("http://localhost:5173/shopOwner/dashboard/add-item");
  });

  it("Adds a new item successfully", () => {
    cy.intercept("POST", "http://localhost:3000/inventory/add-item").as("addItem");
    cy.intercept("POST", "https://firebasestorage.googleapis.com/**").as("firebaseUpload");

    cy.get("[data-cy=item-name]").type("Cypress Test Chair");
    cy.get("[data-cy=item-quantity]").type("5");
    cy.get("[data-cy=item-price]").type("2500");
    cy.get("[data-cy=item-description]").type("Ergonomic office chair");

    cy.get("input[type=file]").selectFile("cypress/fixtures/test-image.jpg");
    cy.contains("Uploading...").should("not.exist");

    cy.get("[data-cy=submit-item]").click();

    cy.wait("@firebaseUpload", { timeout: 15000 });
    cy.wait("@addItem");

    cy.location("pathname", { timeout: 15000 })
      .should("eq", "/shopOwner/dashboard/view-items");
  });
});

describe("Add Item Failure Scenarios", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("http://localhost:5173/shopOwner/dashboard/add-item");
  });

  it("Should reject invalid price values", () => {
    cy.get("[data-cy=item-price]").type("-100");
    cy.get("[data-cy=error-price]").should("contain", "valid price");
    
    // Test non-numeric input
    cy.get("[data-cy=item-price]").clear().type("abc");
    cy.get("[data-cy=error-price]").should("contain", "valid price");
  });

  it("Should reject empty or whitespace-only item names", () => {
    // Test whitespace-only name
    cy.get("[data-cy=item-name]").type("    "); // 4 spaces
    cy.get("[data-cy=error-name]")
      .should("be.visible")
  });

  it("Should reject empty or whitespace-only item description", () => {
    // Test whitespace-only description
    cy.get("[data-cy=item-description]").type("    "); // 4 spaces
    cy.get("[data-cy=error-description]")
      .should("be.visible")
  });

  it("Should reject invalid quantity values", () => {
    // Test negative price
    cy.get("[data-cy=item-quantity]").type("-10");
    cy.get("[data-cy=error-quantity]").should("contain", "valid quantity");
    
    // Test non-numeric input
    cy.get("[data-cy=item-quantity]").clear().type("abc");
    cy.get("[data-cy=error-quantity]").should("contain", "valid quantity");
  });

  it("Should prevent submission without image upload", () => {
    // Fill valid form data
    cy.get("[data-cy=item-name]").type("Test Chair");
    cy.get("[data-cy=item-quantity]").type("5");
    cy.get("[data-cy=item-price]").type("2500");
    cy.get("[data-cy=item-description]").type("Test description");

  });

});
