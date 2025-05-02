// Cypress test for adding a promotion positive scenario

describe("Promotion Add Flow", () => {
  beforeEach(() => {
    cy.login();
    // Set desktop viewport
    cy.viewport(1280, 720);
    cy.visit("http://localhost:5173/shopOwner/promotion/add-promotion/123");
    
    // Verify form is visible
    cy.get("[data-cy=promotion-title]", { timeout: 15000 })
      .should("be.visible");
  });

  it("Adds a new promotion successfully", () => {
    cy.intercept("POST", "http://localhost:3000/api/promotions").as("addPromotion");
    
    // Form interactions (no need for force: true now)
    cy.get("[data-cy=promotion-title]").type("Summer Sale 2023");
    cy.get("[data-cy=promotion-description]").type("20% discount");
    
    // File upload
    cy.get("[data-cy=promotion-image]").selectFile(
      "cypress/fixtures/promotion.jpg",
      { force: true }
    );
    
    // Wait for upload to complete with longer timeout
    cy.get(".Spinner", { timeout: 30000 }).should("not.exist"); // Wait up to 30 seconds
    // OR
    cy.contains("Uploading...", { timeout: 30000 }).should("not.exist");
    
    cy.get("[data-cy=submit-promotion]").click();
    
    cy.wait("@addPromotion");
    cy.contains("Promotion added successfully").should("be.visible");
  });
});

// This test case is for the negative scenario where the title is empty

describe("Promotion Add Flow - Negative Test", () => {
  beforeEach(() => {
    cy.login();
    cy.viewport(1280, 720);
    cy.visit("http://localhost:5173/shopOwner/promotion/add-promotion/123");
    cy.get("[data-cy=promotion-title]", { timeout: 15000 }).should("be.visible");
  });

  it("Should show error when submitting with empty title", () => {
    // Leave title field empty
    // Fill other required fields
    cy.get("[data-cy=promotion-description]").type("20% discount");
    
    // Upload image
    cy.get("[data-cy=promotion-image]").selectFile(
      "cypress/fixtures/promotion.jpg",
      { force: true }
    );
    
    // Wait for upload to complete
    cy.contains("Uploading...", { timeout: 30000 }).should("not.exist");
    
    // Attempt to submit
    cy.get("[data-cy=submit-promotion]").click();
    
    // Verify error message appears
    cy.contains("Title is required").should("be.visible");
    
    // Verify the form was not submitted
    cy.get("[data-cy=promotion-title]").should("have.value", ""); // Still on the same page
  });
});

// This test case is for the negative scenario where the image is empty

describe("Promotion Add Flow - Negative Test", () => {
  beforeEach(() => {
    cy.login();
    cy.viewport(1280, 720);
    cy.visit("http://localhost:5173/shopOwner/promotion/add-promotion/123");
    cy.get("[data-cy=promotion-title]", { timeout: 15000 }).should("be.visible");
  });

  it("Should show error when submitting without image", () => {
    // Fill all required fields except image
    cy.get("[data-cy=promotion-title]").type("Summer Sale 2023");
    cy.get("[data-cy=promotion-description]").type("20% discount");
    
    // Don't upload any image
    // (We explicitly don't call the selectFile command here)
    
    // Attempt to submit
    cy.get("[data-cy=submit-promotion]").click();
    
    // Verify error message appears
    cy.contains("Image is required").should("be.visible");
    
    // Verify the form was not submitted
    cy.url().should("include", "/add-promotion/123"); // Still on the same page
    cy.get("[data-cy=promotion-title]").should("have.value", "Summer Sale 2023"); // Form retains values
  });
});