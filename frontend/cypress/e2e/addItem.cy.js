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

    // Verify navigation
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
    // Test negative price
    cy.get("[data-cy=item-price]").type("-100");
    cy.get("[data-cy=error-price]").should("contain", "valid price");
    
    // Test non-numeric input
    cy.get("[data-cy=item-price]").clear().type("abc");
    cy.get("[data-cy=error-price]").should("contain", "valid price");
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

  it("Should handle server errors during item creation", () => {
    // Mock server error response
    cy.intercept("POST", "http://localhost:3000/inventory/add-item", {
      statusCode: 500,
      body: { message: "Internal server error" }
    }).as("addItemError");

    // Fill valid form data
    cy.fillValidItemForm();
    cy.get("input[type=file]").selectFile("cypress/fixtures/test-image.jpg");
    
    // Submit form
    cy.get("[data-cy=submit-item]").click();
    
  });
});